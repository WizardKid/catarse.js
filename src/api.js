import Postgrest from 'mithril-postgrest';

const platformTokenMeta = document.querySelector('[name="common-platform-token"]');
const platformToken = platformTokenMeta ? platformTokenMeta.getAttribute('content') : null;
const commonRequestHeader = { 'Platform-Code': platformToken };

const apiInit = (api, apiMeta, authUrl, globalHeader) => {
    api.init(apiMeta.getAttribute('content'), { method: 'GET', url: authUrl }, globalHeader);
}

const catarse = new Postgrest();
const catarseApiMeta = document.querySelector('[name="api-host"]');
apiInit(catarse, catarseApiMeta, '/api_token');

const commonPayment = new Postgrest();
const commonPaymentApiMeta = document.querySelector('[name="common-payment-api-host"]');
apiInit(commonPayment, commonPaymentApiMeta,'/api_token/common', commonRequestHeader);

const commonProject = new Postgrest();
const commonProjectApiMeta = document.querySelector('[name="common-project-api-host"]');
apiInit(commonProject, commonProjectApiMeta,'/api_token/common', commonRequestHeader);

const commonAnalytics = new Postgrest();
const commonAnalyticsApiMeta = document.querySelector('[name="common-analytics-api-host"]');
apiInit(commonAnalytics, commonAnalyticsApiMeta, '/api_token/common', commonRequestHeader);

export { catarse, commonPayment, commonProject, commonAnalytics };
