
const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
const { jiraToken } = require("../config");
const { dataConfirmText } = require("../keyboards/text");

let authKey = `Basic ${Buffer.from(
    `nodirbek.quddusov@tisco.uz:${jiraToken}`
).toString('base64')}`
class jiraController {
    getTicketById = async ({ issueKey }) => {
        const axios = Axios.create({
            baseURL: `https://tisco-uz.atlassian.net/rest/api/2/`,
            timeout: 30000,
            headers: {
                'Authorization': authKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return axios
            .get(`issue/${issueKey}`,)
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                return { status: false, message: get(err, 'response.data.errorMessages', 'Error') }
            });
    }

    updateTicketCommentById = async ({ issueKey, bodyData }) => {
        const axios = Axios.create({
            baseURL: `https://tisco-uz.atlassian.net/rest/api/2/`,
            timeout: 30000,
            headers: {
                'Authorization': authKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        return axios
            .post(`issue/${issueKey}/comment`, { body: bodyData, public: true })
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                return { status: false, message: get(err, 'response.data.errorMessages', 'Error') }
            });
    }

    jiraIntegrationResultObj = async ({ list, cred, dataConfirmTextJira }) => {
        let statusObj = {}
        if (get(cred, 'jira.operationsList.comment', false)) {
            // bodyData: get(list, 'comment')
            let jira = await this.updateTicketCommentById({ issueKey: list.ticket, bodyData: dataConfirmTextJira, list })
            if (jira.status) {
                statusObj = { ...statusObj, comment: 1 }
            }
            else {
                statusObj = { ...statusObj, comment: 2, commentError: get(jira, 'message') }
            }
        }
        if (get(cred, 'jira.operationsList.transition', false)) {
            let jira = await this.postTicketTransitionsById({ issueKey: list.ticket, transitionId: get(cred, 'jira.transitionId') })
            if (jira.status) {
                statusObj = { ...statusObj, transition: 1 }
            }
            else {
                statusObj = { ...statusObj, transition: 2, transitionError: get(jira, 'message') }
            }
        }
        if (get(cred, 'jira.operationsList.date', false)) {
            let jira = await this.putTicketDateById({ issueKey: list.ticket })
            if (jira.status) {
                statusObj = { ...statusObj, date: 1 }
            }
            else {
                statusObj = { ...statusObj, date: 2, dateError: get(jira, 'message') }
            }
        }
        return statusObj
    }

    postTicketTransitionsById = async ({ issueKey, transitionId }) => {
        const bodyData = {
            transition: {
                id: transitionId,
            },
        };
        const axios = Axios.create({
            baseURL: `https://tisco-uz.atlassian.net/rest/api/2/`,
            timeout: 30000,
            headers: {
                'Authorization': authKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return axios
            .post(`issue/${issueKey}/transitions`, bodyData)
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                return { status: false, message: get(err, 'response.data.errorMessages', 'Error') }
            });
    }

    putTicketDateById = async ({ issueKey }) => {
        const bodyData = {
            fields: {
                "customfield_10041": new Date(),
            },
        };
        const axios = Axios.create({
            baseURL: `https://tisco-uz.atlassian.net/rest/api/2/`,
            timeout: 30000,
            headers: {
                'Authorization': authKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return axios
            .put(`issue/${issueKey}`, bodyData)
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                return { status: false, message: get(err, 'response.data.errorMessages', 'Error') }
            });
    }
}
module.exports = new jiraController();


