import axios from 'axios';
import 'core-js';
import * as R from 'ramda';
import { GET_COUNTRIES, GET_FIELDS } from './types';

let BASE_URL;
let originFieldsResponse;

export const getCountries = url => async (dispatch) => {
  BASE_URL = url;

  const URL = `${BASE_URL}/api/countryCodes`;
  const promise = await axios.get(URL);

  dispatch({
    type: GET_COUNTRIES,
    payload: JSON.parse(promise.data.response).sort(),
  });
};

export const getFields = countryCode => async (dispatch) => {
  if (countryCode === '' || !countryCode) {
    return;
  }
  const fields = await requestFields(countryCode);
  const subdivisions = await requestSubdivisions(countryCode);
  if (fields && fields.properties) {
    updateStateProvince(fields.properties, subdivisions);
  }
  dispatch({
    type: GET_FIELDS,
    payload: {
      fields,
      formData: {
        countries: countryCode,
      },
    },
  });
};

const requestFields = async (countryCode) => {
  if (countryCode === '' || !countryCode) {
    return;
  }
  const URL = `${BASE_URL}/api/getFields/${countryCode}`;
  const response = await axios.get(URL);
  originFieldsResponse = JSON.parse(response.data.response);
  const parsedFields = parseAllFields(
    JSON.parse(JSON.stringify(originFieldsResponse)),
  );
  return parsedFields;
};

const requestSubdivisions = async (countryCode) => {
  if (countryCode === '' || !countryCode) {
    return;
  }
  const URL = `${BASE_URL}/api/getCountrySubdivisions/${countryCode}`;
  const response = await axios.get(URL);
  const subdivisions = JSON.parse(response.data.response);
  // sorting subdivisions by 'Name'
  return R.sortBy(
    R.compose(
      R.toLower,
      R.prop('Name'),
    ),
  )(subdivisions);
};

const updateStateProvince = (obj, subdivisions) => {
  Object.keys(obj).forEach((k) => {
    if (k === 'StateProvinceCode') {
      obj[k] = {
        ...obj[k],
        enum: subdivisions.map(x => x.Code),
        enumNames: subdivisions.map(x => x.Name),
      };
    } else if (obj[k] !== null && typeof obj[k] === 'object') {
      updateStateProvince(obj[k], subdivisions);
    }
  });
};

const getCountryCode = (form) => {
  for (const [key, value] of Object.entries(form)) {
    if (key === 'countries') {
      return value;
    }
  }
};

const getBody = (form) => {
  const countryCode = getCountryCode(form);
  form = parseFormData(form);
  return {
    AcceptTruliooTermsAndConditions: true,
    CleansedAddress: true,
    ConfigurationName: 'Identity Verification',
    CountryCode: countryCode,
    DataFields: form.Properties,
  };
};

const parseFormDataAdditionalFields = (obj, formData) => {
  Object.keys(obj).forEach((key) => {
    if (key === 'AdditionalFields') {
      // getFormData equivillant value
      const additionalFieldsObj = obj[key];
      const additionalFieldsKeys = Object.keys(
        additionalFieldsObj.properties.properties,
      );

      additionalFieldsKeys.forEach((additionalKey) => {
        findObjInFormDataByKey(formData, additionalKey);
      });
    }
    if (typeof obj[key] === 'object') {
      parseFormDataAdditionalFields(obj[key], formData);
    }
  });
};

const findObjInFormDataByKey = (formData, wantedKey) => {
  Object.keys(formData).forEach((key) => {
    if (wantedKey === key) {
      // temporary hackaround getAdditionalFields (forcing input undefined for the form to be proper)
      formData.AdditionalFields = {
        [key]: formData[key],
      };
      formData[key] = undefined;
      return;
    }
    if (typeof formData[key] === 'object') {
      findObjInFormDataByKey(formData[key], wantedKey);
    }
  });
};

export const submitForm = form => async () => {
  parseFormDataAdditionalFields(originFieldsResponse, form.formData);
  const body = getBody(form.formData);
  const URL = `${BASE_URL}/api/verify`;
  const promiseResult = await axios.post(URL, body).then(response => ({
    ...response,
    body,
  }));
  return promiseResult;
};

const parseFormData = (form) => {
  if (form.Properties.Document) {
    const docFront = form.Properties.Document.DocumentFrontImage;
    form.Properties.Document.DocumentFrontImage = docFront.substr(
      docFront.indexOf(',') + 1,
    );
    const docBack = form.Properties.Document.DocumentBackImage;
    if (docBack) {
      form.Properties.Document.DocumentBackImage = docBack.substr(
        docBack.indexOf(',') + 1,
      );
    }
    const livePhoto = form.Properties.Document.LivePhoto;
    if (livePhoto) {
      form.Properties.Document.LivePhoto = livePhoto.substr(
        livePhoto.indexOf(',') + 1,
      );
    }
  }
  if (form.Properties.NationalIds) {
    form.Properties.NationalIds = [form.Properties.NationalIds];
  }
  return form;
};

const keysThatShouldBeObjects = [
  'Communication',
  'CountrySpecific',
  'Location',
];
const keysThatShouldBeStrings = ['EnhancedProfile'];
const keysThatShouldBeBooleans = ['AcceptIncompleteDocument'];
const keysThatShouldBeFileData = [
  'LivePhoto',
  'DocumentBackImage',
  'DocumentFrontImage',
];

const parseAllFields = (obj) => {
  const parsedFields = parseFields(obj);
  removeAdditionalFields(parsedFields);
  return parsedFields;
};

const parseFields = (obj) => {
  for (const [key, _] of Object.entries(obj)) {
    if (key == 0) {
      return;
    }
    if (keysThatShouldBeObjects.includes(key)) {
      obj[key] = convertToObject(obj[key]);
    }
    if (keysThatShouldBeStrings.includes(key)) {
      obj[key] = convertToString(obj[key]);
    }
    if (keysThatShouldBeBooleans.includes(key)) {
      obj[key] = convertToBoolean(obj[key]);
    }
    if (keysThatShouldBeFileData.includes(key)) {
      obj[key] = convertToFileData(obj[key]);
    }
    if (key === 'label') {
      obj.title = obj[key];
    }
    const currentInnerObj = obj[key];
    if (!currentInnerObj.properties && currentInnerObj.type === 'object') {
      currentInnerObj.type = 'string';
    }
    obj[key] = convertIntToInteger(obj, key);
    parseAdditionalFieldRequired(obj, key);
    parseAdditionalFields(obj, key);
    parseFields(obj[key]);
  }
  return obj;
};

const parseAdditionalFieldRequired = (obj, key) => {
  if (key === 'NationalIds') {
    obj.NationalIds.required = obj.NationalIds.required
      .filter(element => element !== 'nationalid')
      .concat('Type', 'Number');
  }
};

const parseAdditionalFields = (obj, key) => {
  if (key === 'AdditionalFields') {
    const additionalFieldsObj = obj[key];
    const innerObj = additionalFieldsObj.properties.properties;
    let childObj;
    for (const [innerKey, _] of Object.entries(innerObj)) {
      const innerObj = obj.AdditionalFields.properties.properties[innerKey];
      childObj = {
        [innerKey]: innerObj,
      };
    }
    for (const [key, value] of Object.entries(childObj)) {
      obj[key] = value;
    }
  }
};

const removeAdditionalFields = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== null && typeof obj[k] === 'object') {
      if (obj[k].AdditionalFields) {
        const requiredFields = obj[k].AdditionalFields.properties.required;
        obj.required = obj.required
          .filter(requiredProp => requiredProp !== 'AdditionalFields')
          .concat(requiredFields);
        obj[k] = R.omit(['AdditionalFields'], obj[k]);
      }
      removeAdditionalFields(obj[k]);
    }
  });
};

const convertIntToInteger = (obj, key) => {
  if (key === 'type' && obj[key] === 'int') {
    return 'integer';
  }
  return obj[key];
};

const convertToObject = (obj) => {
  if (obj) {
    return {
      ...obj,
      type: 'object',
    };
  }
  return obj;
};

const convertToFileData = (obj) => {
  if (obj) {
    return {
      ...obj,
      type: 'string',
      format: 'data-url',
    };
  }
};

const convertToString = (obj) => {
  if (obj) {
    return {
      ...obj,
      type: 'string',
    };
  }
  return obj;
};

const convertToBoolean = (obj) => {
  if (obj) {
    return {
      ...obj,
      type: 'boolean',
    };
  }
  return obj;
};
