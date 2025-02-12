import axios from 'axios';

const countries = '["CA", "US"]';
const fields = '{ "title": "DataFields", "type": "object", "properties": { "Location": { "title": "Location", "type": "object", "properties": { "StateProvinceCode": { "type": "string", "description": "State of primary residence. US sources expect 2 characters. Australian sources expect 2 or 3 characters.", "label": "State" }, "PostalCode": { "type": "string", "description": "ZIP Code or Postal Code of primary residence", "label": "Postal Code" }}, "required": [ "PostalCode" ]}}}';
const subDivisions = '{"data":{"response":"[{"Name":"Oklahoma","Code":"OK","ParentCode":""},{"Name":"Kentucky","Code":"KY","ParentCode":""},{"Name":"Louisiana","Code":"LA","ParentCode":""},{"Name":"Maine","Code":"ME","ParentCode":""},{"Name":"Maryland","Code":"MD","ParentCode":""},{"Name":"Massachusetts","Code":"MA","ParentCode":""},{"Name":"Michigan","Code":"MI","ParentCode":""},{"Name":"Minnesota","Code":"MN","ParentCode":""},{"Name":"Mississippi","Code":"MS","ParentCode":""},{"Name":"Missouri","Code":"MO","ParentCode":""},{"Name":"Montana","Code":"MT","ParentCode":""},{"Name":"Nebraska","Code":"NE","ParentCode":""},{"Name":"Nevada","Code":"NV","ParentCode":""},{"Name":"Iowa","Code":"IA","ParentCode":""},{"Name":"Indiana","Code":"IN","ParentCode":""},{"Name":"Alaska","Code":"AK","ParentCode":""},{"Name":"Arizona","Code":"AZ","ParentCode":""},{"Name":"Arkansas","Code":"AR","ParentCode":""},{"Name":"California","Code":"CA","ParentCode":""},{"Name":"Colorado","Code":"CO","ParentCode":""},{"Name":"Connecticut","Code":"CT","ParentCode":""},{"Name":"Delaware","Code":"DE","ParentCode":""},{"Name":"Florida","Code":"FL","ParentCode":""},{"Name":"Georgia","Code":"GA","ParentCode":""},{"Name":"Hawaii","Code":"HI","ParentCode":""},{"Name":"Idaho","Code":"ID","ParentCode":""},{"Name":"Illinois","Code":"IL","ParentCode":""},{"Name":"New Hampshire","Code":"NH","ParentCode":""},{"Name":"New Jersey","Code":"NJ","ParentCode":""},{"Name":"New Mexico","Code":"NM","ParentCode":""},{"Name":"Virginia","Code":"VA","ParentCode":""},{"Name":"Washington","Code":"WA","ParentCode":""},{"Name":"West Virginia","Code":"WV","ParentCode":""},{"Name":"Wisconsin","Code":"WI","ParentCode":""},{"Name":"Wyoming","Code":"WY","ParentCode":""},{"Name":"District of Columbia","Code":"DC","ParentCode":""},{"Name":"American Samoa","Code":"AS","ParentCode":""},{"Name":"Guam","Code":"GU","ParentCode":""},{"Name":"Northern Mariana Islands","Code":"MP","ParentCode":""},{"Name":"Puerto Rico","Code":"PR","ParentCode":""},{"Name":"United States Minor Outlying Islands","Code":"UM","ParentCode":""},{"Name":"Virgin Islands, U.S.","Code":"VI","ParentCode":""},{"Name":"Vermont","Code":"VT","ParentCode":""},{"Name":"Utah","Code":"UT","ParentCode":""},{"Name":"Alabama","Code":"AL","ParentCode":""},{"Name":"New York","Code":"NY","ParentCode":""},{"Name":"North Carolina","Code":"NC","ParentCode":""},{"Name":"North Dakota","Code":"ND","ParentCode":""},{"Name":"Ohio","Code":"OH","ParentCode":""},{"Name":"Oregon","Code":"OR","ParentCode":""},{"Name":"Pennsylvania","Code":"PA","ParentCode":""},{"Name":"Rhode Island","Code":"RI","ParentCode":""},{"Name":"Kansas","Code":"KS","ParentCode":""},{"Name":"South Carolina","Code":"SC","ParentCode":""},{"Name":"South Dakota","Code":"SD","ParentCode":""},{"Name":"Tennessee","Code":"TN","ParentCode":""},{"Name":"Texas","Code":"TX","ParentCode":""}]","signature":"0e246c46ed64d25fb2fdaf25d884c095759bd61a0ef0c667978f5694a74509e9eda3233e63446d41f6f23c7c755436e52969d31776c25d2f3ab7f9853ca0517dc842fda849311b09b17b8ae2e1222cb0bb7fa6cebb4bf66a3bcf3f79e466fdf6e0d826de6d0109d1956afc6c1bb0c726e5221d369fdb2064dd6ac3496fe9d77d"},"status":200,"statusText":"OK","headers":{"content-type":"application/json; charset=utf-8"},"config":{"transformRequest":{},"transformResponse":{},"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"headers":{"Accept":"application/json, text/plain, */*"},"method":"get","url":"http://localhost:3111/api/getCountrySubdivisions/US"},"request":{}}';
const response = (data) => ({ status: 200, data: { response: data } });

const mockApi = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('countryCodes')) {
      return Promise.resolve(response(countries));
    }
    if (url.includes('getFields')) {
      return Promise.resolve(response(fields));
    }
    if (url.includes('countrysubdivisions')) {
      return Promise.resolve(response(subDivisions));
    }
    return Promise.reject();
  });
};

export default mockApi;
