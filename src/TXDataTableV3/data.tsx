import React from 'react';
import { TxCoreButton } from 'tradeport-web-components/dist/react';
import { CODE_DECODE_DROPDOWN } from '@atoms/TXInput';
import { UploadCell } from "./index";
import { getDeepValue } from './utils';
import { TXPartyName } from '@tradexpress/schemas/dist/TXPartyName';
import styled from 'styled-components';

export const ExceptionColumn = styled.div`
  display: flex;
  align-items: center;
  > span {
    height: 14px;
    width: 14px;
    border-radius: 14px;
    background-color: var(--color-danger);
    color: white;
    font-size: 8px;
    font-weight: bold;
    margin-right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  tx-core-icon {
    margin-left: 5px;
    color: var(--color-primary-darker);
    &:hover {
      color: var(--color-primary);
    }
  }
`;

export const DATA_SOURCE = {
  "totalRecordCount": 49209,
  "txnWorkDeskList": [
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "status": true,
      "intentAction": "D",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 9999
        },
        "formattedValue": {
          "value": 9999
        }
      },
      "referenceDataStepDetails": {
        "stepAction": {
            "value": "AMD"
        },
        "stepStatus": {
            "value": "PNR"
        },
        "businessDate": {
            "value": "2023-06-15"
        },
        "makerID": {
            "value": "1663159"
        },
        "makerTimestamp": {
            "value": "2023-11-15T07:13:34.394709Z"
        },
        "checkerID": null,
        "checkerTimestamp": null
      },
      "acknowledgementNumber": 0,
      "splitRequestID": {
        "value": "23100019-001"
      },
      "transactionWorkflowID": {
        "value": "23100019-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "5d8b5660-de86-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T07:46:59.581419Z",
      "transactionReference": "SPBTR22RFC000002",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T07:47:14.543Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "partyName": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "6cd87e2a-ca70-4ce6-b16c-0f3323928632"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T07:47:12.394221Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 0,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "intentAction": "U",
      "amount": {
        "currency": {
          "value": "BHD"
        },
        "unFormattedValue": {
          "value": 1111
        },
        "formattedValue": {
          "value": 1111
        }
      },
      "referenceDataStepDetails": {
        "stepAction": {
            "value": "CRE"
        },
        "stepStatus": {
            "value": "PNR"
        },
        "businessDate": {
            "value": "2023-06-15"
        },
        "makerID": {
            "value": "1663159"
        },
        "makerTimestamp": {
            "value": "2023-11-15T12:54:57.525882Z"
        },
        "checkerID": null,
        "checkerTimestamp": null
      },
      "acknowledgementNumber": {
        value: "23100022",
        isChanged: true,
        previous: {
          value: "231xxxxx"
        }
      },
      "splitRequestID": {
        "value": "23100022-001"
      },
      "transactionWorkflowID": {
        "value": "23100022-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "20496fce-de8a-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:13:54.691504Z",
      "transactionReference": "SPBTR22RFC000004",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:14:00.294589Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "3199d6a2-699c-472e-8a4d-f9b643d03b61"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:13:59.874244Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 1,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "intentAction": { value: "N" },
      "acknowledgementNumber": "23100023",
      "splitRequestID": {
        "value": "23100023-001"
      },
      "transactionWorkflowID": {
        "value": "23100023-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "5f0f286d-de8c-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:29:59.000216Z",
      "transactionReference": "SPBTR22RFC000005",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:30:00.497678Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "fc4189c3-d54d-407c-b23c-c508c12109d8"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:30:00.314521Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 2,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "intentAction": "U",
      "acknowledgementNumber": {
        value: "Acknowledgement Number with very long long long long text",
        isChanged: true,
        previous: {
          value: "23100024"
        }
      },
      "splitRequestID": {
        "value": "23100024-001"
      },
      "transactionWorkflowID": {
        "value": "23100024-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "9dbbd130-de8d-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:38:53.646122Z",
      "transactionReference": "SPBTR22RFC000007",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:38:55.105002Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "97c9dae2-7e92-4619-bb2b-d3e9dbcb96aa"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 1000,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "EIF_AUTO_SFC_1001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:38:54.998514Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 1000,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 3,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "intentAction": "C",
      "acknowledgementNumber": "23100025",
      "splitRequestID": {
        "value": "23100025-001"
      },
      "transactionWorkflowID": {
        "value": "23100025-001"
      },
      "transactionWorkflowStage": "REGFL",
      "transactionCaseID": {
        "value": "cb9ba25f-de8e-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGIN"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:47:20.107505Z",
      "transactionReference": "SPBTR22RFC000009",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-06-19T13:04:16.264845Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "6b959ce3-e5f6-4f26-8ce9-a8cb40d91f4b"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:47:20.624097Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": {
        "value": "NEW Step not completed for SPBTR23PFC000004"
      },
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 4,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100026",
      "splitRequestID": {
        "value": "23100026-001"
      },
      "transactionWorkflowID": {
        "value": "23100026-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "d9e773c2-de8e-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:47:44.092927Z",
      "transactionReference": "SPBTR22RFC000012",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:47:44.383621Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "02e78709-c4de-4e4a-bef8-8926faf3e2ef"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:47:44.332641Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 5,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100027",
      "splitRequestID": {
        "value": "23100027-001"
      },
      "transactionWorkflowID": {
        "value": "23100027-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "fbb4dd85-de8e-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:48:40.803275Z",
      "transactionReference": "SPBTR22RFC000014",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:48:41.157206Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "3304616a-dd33-4e09-b34f-f713fc4ef52c"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:48:41.097504Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 6,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100028",
      "splitRequestID": {
        "value": "23100028-001"
      },
      "transactionWorkflowID": {
        "value": "23100028-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "fa987be8-de8f-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T08:55:48.435767Z",
      "transactionReference": "SPBTR22RFC000016",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T08:55:49.113127Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "73b3f4ae-df51-4e32-98bd-509306b636f1"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 5701.51,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFA-1304-004",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T08:55:49.05156Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 5701.51,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 7,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100029",
      "splitRequestID": {
        "value": "23100029-001"
      },
      "transactionWorkflowID": {
        "value": "23100029-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "45dfea92-de91-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T09:05:04.230462Z",
      "transactionReference": "SPBTR22RFC000018",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T09:05:04.968643Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "ec13d08b-b0f9-45b0-88b1-c9daca2a5ea0"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 5701.51,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFA-1304-004",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T09:05:04.870791Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 5701.51,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 8,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100031",
      "splitRequestID": {
        "value": "23100031-001"
      },
      "transactionWorkflowID": {
        "value": "23100031-001"
      },
      "transactionWorkflowStage": "PRINP",
      "transactionCaseID": {
        "value": "ad78ccc4-de92-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "REGCP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T09:15:07.534774Z",
      "transactionReference": "SPBTR22RFC000020",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T09:15:08.136542Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "536b60d4-8889-4c34-8f89-dc1b726747f2"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 5701.51,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFA-1304-004",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T09:15:08.078298Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 5701.51,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 9,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100039",
      "splitRequestID": {
        "value": "23100039-001"
      },
      "transactionWorkflowID": {
        "value": "23100039-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "c839c270-dea2-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T11:10:24.367559Z",
      "transactionReference": "SPBTR22RFC000031",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T11:10:30.196367Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "90185f86-2314-4a1d-90e8-b2ba41008188"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 1200,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "EIF_AUTO_SFC_1001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T11:10:25.085962Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 1200,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 10,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100041",
      "splitRequestID": {
        "value": "23100041-001"
      },
      "transactionWorkflowID": {
        "value": "23100041-001"
      },
      "transactionWorkflowStage": "STREJ",
      "transactionCaseID": {
        "value": "910bb927-dea8-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "EXEMK"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T11:51:48.772436Z",
      "transactionReference": "SPBTR22RFC000034",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-06-20T10:25:18.773199Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "44c507b8-e0e7-42fc-ad39-1538f56c2f00"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 5701.51,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFA-1304-004",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": false,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": {
        "value": false
      },
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T11:51:49.4013Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 5701.51,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 11,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100043",
      "splitRequestID": {
        "value": "23100043-001"
      },
      "transactionWorkflowID": {
        "value": "23100043-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "e296bf06-deaa-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:08:24.571571Z",
      "transactionReference": "SPBTR22RFC000036",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:08:26.845216Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "24a42446-39fd-4654-ab8a-fd574a73cd58"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 3000,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUREF-EIFA-0803-SIT2-01",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:08:25.202775Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 3000,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 12,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100044",
      "splitRequestID": {
        "value": "23100044-001"
      },
      "transactionWorkflowID": {
        "value": "23100044-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "1280fb99-deab-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:09:44.959603Z",
      "transactionReference": "SPBTR22RFC000038",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:09:46.36989Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "045111dd-ec80-446d-85f5-0bf8aab13682"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-EIFM-0911-SIT2-005",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:09:45.167825Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 13,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100045",
      "splitRequestID": {
        "value": "23100045-001"
      },
      "transactionWorkflowID": {
        "value": "23100045-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "58c93344-deae-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:33:11.363036Z",
      "transactionReference": "SPBTR22RFC000040",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:33:13.609974Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "fb3371ae-292b-485c-9054-b5452724993d"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 1100,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "EIF_AUTO_SFC_1001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:33:12.078204Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 1100,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 14,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100046",
      "splitRequestID": {
        "value": "23100046-001"
      },
      "transactionWorkflowID": {
        "value": "23100046-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "6cf62627-deae-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:33:45.211636Z",
      "transactionReference": "SPBTR22RFC000042",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:33:46.390465Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "933a8a0a-a40c-4249-a25c-a409764b0c3a"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 1200,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "EIF_AUTO_SFC_1001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:33:45.38706Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 1200,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 15,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100047",
      "splitRequestID": {
        "value": "23100047-001"
      },
      "transactionWorkflowID": {
        "value": "23100047-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "a137fd0a-deae-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:35:12.885145Z",
      "transactionReference": "SPBTR22RFC000044",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:35:14.176924Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "3d899c5a-1f37-42d2-982f-5ef04970307d"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 1200,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "EIF_AUTO_SFC_1001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:35:13.067813Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 1200,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 16,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100048",
      "splitRequestID": {
        "value": "23100048-001"
      },
      "transactionWorkflowID": {
        "value": "23100048-001"
      },
      "transactionWorkflowStage": "EXENC",
      "transactionCaseID": {
        "value": "bc119ccd-deae-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "PRINP"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T12:35:57.931338Z",
      "transactionReference": "SPBTR22PFC000002",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-19T12:35:59.217652Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "IIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "4f3aaab7-015c-4504-9e7d-6028bd62ded8"
      },
      "productGroup": {
        "value": "PF"
      },
      "stepAmount": 9857.08,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-IIFA-1111-SIT2-001",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": null,
      "assignedUserId": null,
      "assignedUserName": null,
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T12:35:58.204213Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 9857.08,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 17,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100051",
      "splitRequestID": {
        "value": "23100051-001"
      },
      "transactionWorkflowID": {
        "value": "23100051-001"
      },
      "transactionWorkflowStage": "EXEMK",
      "transactionCaseID": {
        "value": "794d30ab-deb2-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "EXEMK"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T13:02:43.902361Z",
      "transactionReference": "SPBTR22RFC000045",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-24T23:18:28.360153Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "08fc42fa-dbc0-4332-a10d-9d8b8dee5dba"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 11000,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-1208-009",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": true,
      "assignedUserId": "1617902",
      "assignedUserName": "Kadambala,Suresh Kumar",
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T13:02:44.96525Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 11000,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 18,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    },
    {
      "institution": "SC",
      "requestWorkflowID": null,
      "fileID": null,
      "acknowledgementNumber": "23100052",
      "splitRequestID": {
        "value": "23100052-001"
      },
      "transactionWorkflowID": {
        "value": "23100052-001"
      },
      "transactionWorkflowStage": "EXEMK",
      "transactionCaseID": {
        "value": "37001d5e-deb3-11ed-8576-da5942bdde18"
      },
      "txBookingLocation": "SG01",
      "transactionWorkflowPreviousStage": {
        "value": "EXEMK"
      },
      "transactionWorkflowInitiatedTimestamp": "2023-04-19T13:08:02.163932Z",
      "transactionReference": "SPBTR22RFC000046",
      "registrationDetails": null,
      "lastModifiedTimestamp": {
        "value": "2023-04-24T23:18:28.444086Z"
      },
      "transactionWorkflowLogID": null,
      "fileIDs": null,
      "product": "EIF",
      "step": "NEW",
      "stepNumber": "NEW001",
      "customerID": "100006898",
      "submissionCountry": null,
      "submissionMode": "TNG",
      "splitStatus": null,
      "countOfExceptions": null,
      "splitErrorCount": null,
      "bulkRequest": null,
      "finRequestType": null,
      "prevSplitRequestID": null,
      "docSubmitRefID": null,
      "amlStatus": null,
      "lliStatus": null,
      "sanctionStatus": null,
      "callbackStatus": null,
      "latestStepAssociationID": {
        "value": "b85e921b-e41c-4aac-81fe-31f4bf8641ea"
      },
      "productGroup": {
        "value": "RF"
      },
      "stepAmount": 11000,
      "stepCurrency": {
        "value": "USD"
      },
      "almPaymentStatus": "NREQ",
      "almFinanceStatus": "NREQ",
      "clientReference": "CUSTREF-1208-009",
      "customerName": "AQXEW XXXXXZ XXFNSRWRPX TXX",
      "isAttachmentDetails": {
        "value": false
      },
      "stepDetails": null,
      "registrationRequestID": null,
      "transactionTracker": null,
      "bookingCountry": {
        "value": "SG"
      },
      "cmtFlag": {
        "value": false
      },
      "sciLegalEntityID": {
        "value": "11147520"
      },
      "cmtApprovalStatus": {
        "value": "NREQ"
      },
      "transactionDate": {
        "value": "2022-01-12"
      },
      "masterVersionNumber": {
        "value": "000000"
      },
      "lockedFlag": true,
      "assignedUserId": "1617902",
      "assignedUserName": "Kadambala,Suresh Kumar",
      "stepReleased": null,
      "stepCreatedEvent": null,
      "cmtRemarks": null,
      "cmtDealId": null,
      "businessDate": {
        "value": "2022-01-12"
      },
      "subStep": {
        "value": "DRFF"
      },
      "changeDelete": null,
      "cmtResponseStatus": null,
      "cmtResponseTimestamp": null,
      "fxContractExists": null,
      "clientRemarksExists": null,
      "customerServiceLevel": null,
      "urgentFlag": null,
      "urgentQueued": null,
      "registrationTimestamp": {
        "value": "2023-04-19T13:08:02.786528Z"
      },
      "targetCompletionTime": null,
      "weightage": null,
      "publishToWPM": null,
      "isBTCFreeTextExists": null,
      "isSHIExists": null,
      "stepReleasedDate": null,
      "segment": {
        "value": "ME"
      },
      "subSegment": {
        "value": "03"
      },
      "sequenceNumber": 0,
      "deleteApplicable": {
        "value": false
      },
      "batchId": null,
      "preProcessExceptionFlag": {
        "value": false
      },
      "newStepCurrency": {
        "value": "USD"
      },
      "newStepAmount": 11000,
      "tradeportCountry": {
        "value": "SP"
      },
      "isCancelWorkflow": {
        "value": false
      },
      "registrationFailureReason": null,
      "linkedTransactionReference": null,
      "linkedStepNumber": null,
      "linkedSubStep": null,
      "isAutoStep": {
        "value": false
      },
      "isManualFinance": {
        "value": false
      },
      "userID": null,
      "userName": null,
      "isFutureDatedTransaction": null,
      "index": 19,
      "trdExceptionCount": 0,
      "sduExceptionCount": 0,
      "clmExceptionCount": 0,
      "crcExceptionCount": 0,
      "cmtStatus": "NREQ"
    }
  ]
};

export const COLUMN_SETTINGS = [
  {
    title: 'ARN #',
    column: 'acknowledgementNumber',
    width: '180px',
    align: 'center',
    pinned: true,
    draggable: false,
    filterConfig: {
      type: "number-range",
    },
    actionConfig: {
      type: "text",
      isUnique: true, // check for duplicate data
      // schema: {
      //   type: "string",
      //   maxLength: 8,
      //   minLength: 8,
      // }
      schema: (rowValue, isSelected) => {
        return isSelected ? {
          type: "string",
          maxLength: 8,
          minLength: 8,
        } : undefined
      }
    }
  },
  // {
  //   title: 'CUSTOMER',
  //   column: 'customerID',
  //   columnCustomRenderer: (_, data) => {
  //     const cName = getDeepValue(data, 'customerName');
  //     const cID = getDeepValue(data, 'customerID');
  //     return cName && cID ? `${cName} - ${cID}` : "";
  //   },
  //   width: '250px',
  //   align: 'left',
  // },
  {
    title: 'PRODUCT',
    column: 'product',
    width: '120px',
    align: 'center',
    filterConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "PRODUCTS",
      placeholder: "Select products"
    },
    // actionConfig: false,
    actionConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "PRODUCTS",
      placeholder: "Select products"
    }
  },
  {
    title: 'TRN #',
    column: 'transactionReference',
    width: '180px',
    align: 'center',
    pinned: true,
    actionConfig: false,
    filterConfig: {
      type: "text",
      placeholder: "Select Transaction"
    }
  },
  {
    title: 'Maker Date & Time',
    column: 'referenceDataStepDetails',
    width: '160px',
    align: 'center',
    columnCustomRenderer: (_, data) => {
      let makerTimestamp = getDeepValue(data, 'referenceDataStepDetails.makerTimestamp.value');
      return makerTimestamp
    },
  },
  {
    title: 'REG. DATE',
    column: 'transactionWorkflowInitiatedTimestamp',
    // columnCustomRenderer: (_, value) => formatDate(value?.transactionWorkflowInitiatedTimestamp),
    width: '180px',
    align: 'center',
    filterConfig: {
      type: "date-range",
      value: ""
    },
    // actionConfig: false,
    actionConfig: {
      type: "date",
      placeholder: "Select date"
    }
  },
  {
    title: 'Currency',
    column: 'amount.currency',
    width: '80px',
    pinned: "none",
    sorted: "none",
    actionConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "CURENCIES",
      placeholder: "Select currency"
    }
  },
  {
    title: 'Amount',
    column: 'amount',
    width: '120px',
  },
  // {
  //   title: 'STEP',
  //   column: 'stepNumber',
  //   width: '100px',
  //   align: 'center',
  //   columnCustomRenderer: (text) => <a href="#">{text}</a>
  // },
  {
    title: 'Party Name',
    column: 'partyName',
    width: '120px',
    pinned: "none",
    draggable: false,
    sorted: "none",
    actionConfig: {
      type: "text",
      schema: TXPartyName,
      placeholder: "Enter Party Name",
    }
  },
  {
    title: 'SUB STEP',
    column: 'subStep',
    width: '120px',
    align: 'center',
    filterConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "SUB_STEPS",
      placeholder: "Select sub steps",
      multiSelect: true
    },
    actionConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "SUB_STEPS",
      placeholder: "Select sub steps",
      multiSelect: true
    }
  },
  // {
  //   title: 'LOCKED BY',
  //   column: 'assignedUserId',
  //   width: '120px',
  //   align: 'left'
  // },
  // {
  //   title: 'STAGE',
  //   column: 'transactionWorkflowStage',
  //   width: '100px',
  //   align: 'left',
  // },
  {
    title: 'status',
    column: 'status',
    width: '100px',
    type: 'isYesNo',
  },
  {
    column: 'fileID',
    title: 'Attachment',
    width: '120px',
    sorted: 'none',
    columnCustomRenderer: (_, rowData) => {
      return (
        <UploadCell
          data={rowData} // Required
          editable
          onFileChange={(file) => console.log(file)}
          accept="image/*" // Accept only images
        />
      )
    }
  },
  // {
  //   title: 'lli',
  //   groupTitle: 'COMPLIANCE STATUS',
  //   column: 'lliStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // }, {
  //   title: 'aml',
  //   groupTitle: 'COMPLIANCE STATUS',
  //   column: 'amlStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // }, {
  //   title: 'snc',
  //   groupTitle: 'COMPLIANCE STATUS',
  //   column: 'sanctionStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // }, {
  //   title: 'clbk',
  //   groupTitle: 'COMPLIANCE STATUS',
  //   column: 'callbackStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // },
  // {
  //   title: 'ALM-P',
  //   groupTitle: 'ALM STATUS',
  //   column: 'almPaymentStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // },
  // {
  //   title: 'ALM-F',
  //   groupTitle: 'ALM STATUS',
  //   column: 'almFinanceStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // },
  // {
  //   title: 'COCOA',
  //   column: 'cmtStatus',
  //   width: '70px',
  //   pinned: "none",
  //   sorted: "none",
  //   align: 'center',
  // },
  // {
  //   title: 'CUSTOMER REFERENCE',
  //   column: 'clientReference',
  //   width: '250px',
  //   align: 'left',
  // },
  // {
  //   title: 'CUSTOM Column 1',
  //   column: 'transactionWorkflowID',
  //   width: '80px',
  // },
  {
    title: 'CUSTOM Column 2',
    column: 'splitRequestID',
    width: '150px',
    columnCustomRenderer: (_, data) => `${data?.splitRequestID?.value} ${data?.transactionWorkflowID?.value}`
  },
  // {
  //   title: 'SUBMISSION MODE',
  //   column: 'submissionMode',
  //   width: '180px',
  //   align: 'center'
  // },
  // {
  //   title: 'Attachment',
  //   column: '',
  //   columnCustomRenderer: (_, data) => {
  //     // const { transactionWorkflowStage, amlStatus } = data;
  //     // const isRequestReprocess = !!data && transactionWorkflowStage === 'PDCMP' && amlStatus === 'L1PEND';
  //     return (
  //       <div onClick={() => window.open("", "_blank")} style={{color: 'var(--color-primary)'}}>
  //         <TxCoreIcon icon="attachment"/>
  //       </div>
  //       // <TxCoreButton
  //       //   variation="primary"
  //       //   size="small"
  //       //   disabled={!isRequestReprocess}
  //       //   onButtonClick={() => { }}
  //       // >
  //       //   Request Reprocess
  //       // </TxCoreButton>
  //     )
  //   },
  //   width: '100px',
  //   align: 'center',
  //   sorted: 'none',
  //   pinned: 'none'
  // }
];

export const ADVANCED_FILTER_SETTINGS = [
  {
    id: "ack-settings",
    title: "Ack Settings",
    default: true,
    fields: [
      {
        id: "userDetails.email",
        label: "Email",
        type: "text",
      }
    ]
  },
  {
    id: "trn-settings",
    title: "TRN Settings",
    fields: [
      {
        id: "test-key1",
        label: "Test Input 1",
        type: "text",
        value: "test"
      },
      {
        id: "test-key2",
        label: "Test Input 2",
        type: "select",
        value: "test-dropdown",
        options: [{
          value: "test-dropdown",
          text: "Test Dropdown"
        }, {
          value: "test-dropdown1",
          text: "Test Dropdown 1"
        }, {
          value: "test-dropdown2",
          text: "Test Dropdown 2"
        }]
      },
      {
        id: "test-key3",
        type: "text",
        label: "Test Input 3",
        value: "testtestest"
      }
    ]
  }
];

export const TEST_COLUMN_SETTINGS = [
  {
    column: 'username',
    title: 'Username',
    align: 'center',
    pinned: true,
    groupTitle: 'test',
    order: 0,
    filterConfig: {
      type: 'text',
      // value: "0"
    },
  },
  {
    column: 'password',
    title: 'Password',
    width: '200px',
    sorted: 'none',
    order: 1,
  },
  // {
  //   column: 'userDetails.email',
  //   title: 'Email',
  //   groupTitle: 'User Details',
  //   order: 3,
  //   pinned: true
  // },
  {
    column: 'userDetails.isAdmin',
    title: 'Is Admin',
    groupTitle: 'User Details',
    order: 2,
    pinned: 'none',
    filterConfig: {
      type: 'select',
      options: [{
        text: 'clear',
        value: ''
      }, {
        text: 'admin',
        value: 'true'
      }, {
        text: 'clerk',
        value: 'false'
      }]
    },
  },
  {
    column: 'userDetails.other',
    title: 'Other',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.birthDay',
    title: 'Birth Day',
    groupTitle: 'User Details',
    order: 5,
    filterConfig: {
      type: 'date-range',
    },
  },
  {
    column: 'userDetails.age',
    title: 'Age',
    groupTitle: 'test Details',
    order: 4,
    filterConfig: {
      type: 'number-range',
      // value: {min: 10, max: 50}
    },
  },
  {
    column: 'userDetails.firstName',
    title: 'First Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.lastName',
    title: 'Last Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.phoneNumber',
    title: 'Phone Number',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.address',
    title: 'Address',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.city',
    title: 'City',
  },
  {
    column: 'userDetails.state',
    title: 'State',
  },
  {
    column: 'userDetails.zipCode',
    title: 'Zip Code',
  },
  {
    column: 'userAccounts[0].account1',
    title: 'Account 1',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userAccounts[1].account2',
    title: 'Account 2',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userAccounts[2].account3',
    title: 'Account 3',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userID',
    title: '#',
    pinned: "none",
    sorted: "none",
    align: "center",
    columnCustomRenderer: (value) => <button onClick={e => {
      e.stopPropagation();
      console.log(`button ${value} clicked`)
    }} style={{ fontSize: 5 }}>Button {value}</button>
  },
];

export const CUSTOM_ROW_SETTINGS = [
  {
    column: "intentAction",
    value: "D",
    // showColumn: false,
    styles: {
      color: "var(--color-danger-darker)",
      backgroundColor: "var(--color-danger-pale)",
      // backgroundColor: "#FFE380",
      textDecoration: "line-through"
    }
  },
  {
    column: "intentAction",
    value: "U",
    showColumn: false,
    styles: {
      backgroundColor: "#FFE380",
    }
  },
  {
    column: "intentAction",
    value: "N",
    showColumn: false,
    styles: {
      backgroundColor: "#FFE380",
      // backgroundColor: "var(--color-success-pale)",
    }
  },
  {
    column: "intentAction",
    value: "C",
    showColumn: false,
    styles: {
      backgroundColor: "#d0eceb",
      fontWeight: "bold",
      fontStyle: "italic"
    }
  }
];

export const API_FILTER_DATA: any = {
  "ackNumber": null,
  "fromDateWithTime": null,
  "toDateWithTime": null,
  "submissionMode": null,
  "bookingLocation": "SG01",
  "transactionWorkflowStage": [
      "CMPCL",
      "DABCK",
      "DABCM",
      "DABMK",
      "DABBK",
      "EXECA",
      "EXECR",
      "EXENC",
      "EXECK",
      "EXEMK",
      "FDRCK",
      "FDRMK",
      "IMBCA",
      "IMBCR",
      "IMBRI",
      " PDCMP",
      "IMBCK",
      "IMBMK",
      "PDPRC",
      "PDREF",
      "PDRWB",
      "PDRRM",
      "PDRTO",
      "PREXE",
      "PPRCA",
      "PPRCR",
      "PPRMK",
      "PRPRC",
      "PPRCK",
      "PRINP",
      "REPRQ",
      "RELPG",
      "STWFS",
      "TXPCK",
      "TXPCR",
      "TXPMK",
      "REGCP",
      " REFAP",
      "PDLKA",
      "TXNPR"
  ],
  "product": null,
  "generatedBy": null,
  "clientReference": null,
  "step": null,
  "subStep": null,
  "amlStatus": null,
  "serviceLevel": null,
  "callbackStatus": null,
  "lliStatus": null,
  "sanctionStatus": null
};

const getRandomBirthDate = () => {
  const minAge = 18; // Minimum age for generated birthdate
  const maxAge = 80; // Maximum age for generated birthdate

  // Calculate a random age within the specified range
  const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  // Calculate birthdate by subtracting the random age from the current date
  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - randomAge);

  // Calculate age based on birthdate and current date
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();

  // Adjust age if birthdate hasn't occurred this year yet
  if (
    today.getMonth() < birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())
  ) {
    age--;
  }

  return {
    birthdate: `${birthdate.getFullYear()}-${birthdate.getMonth() + 1}-${birthdate.getDate()}`,
    age
  };
}

export const getRandomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const selectRandomString = (stringsArray) => {
  const randomIndex = Math.floor(Math.random() * stringsArray.length);
  return stringsArray[randomIndex];
}

const getIntentAction = (index) => {
  switch(true) {
    case index === 0:
      return 'U';
    case index === 1:
      return '';
    case index === 2:
    case index === 3:
    case index === 4:
      return 'O';
    default: return '';
  }
}
export const DUMMY_DATA_SOURCE = Array(100).fill('').map((_, i) => ({
  intentAction: getIntentAction(i),
  id: `id-${i}`,
  text: i === 0 ? {
    previous: {value: 'Test previous value'},
    value: `Some name ${i}`,
    isChanged: true
  } : `Some name ${i}`,
  /** Returns birthdate and age */
  ...getRandomBirthDate(),
  // birthdate: '12-Nov-1958',
  // userID: 138319,
  userID: getRandomNumberBetween(100000, 1000000),
  isActive: true,
  isOnLeave: false,
  needDevice: false,
  level: 'level-1',
  country: 'US',
  devices: `laptop,${i === 0 ? 'mouse' : ''}`,
  new: {
    test: {
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 333
        },
        "formattedValue": {
          "value": 333
        }
      },
    }
  },
  "amount": {
    "currency": {
      "value": "USD"
    },
    "unFormattedValue": {
      "value": 999
    },
    "formattedValue": {
      "value": 999
    }
  },
  "reqWorkflowStage": "Registration Completed",
  "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
}));

export const EDITABLE_COLUMN_SETTINGS = [
  {
    title: 'Name (Free Text)',
    column: 'text',
    width: 150,
    actionConfig: {
      type: 'text',
      placeholder: 'Set name',
      isUnique: true,
      // value: 'test', // this will be the initial value of the cell when adding
      schema: {
        type: "string",
        minLength: 1,
      }
    },
    filterConfig: {
      type: 'text',
    }
  },
  {
    title: 'Birthday (Date)',
    column: 'birthdate',
    actionConfig: {
      type: 'date',
      placeholder: 'Set date',
      disabled: true,
      schema: {
        type: "string",
        minLength: 1,
      }
    }
  },
  {
    title: 'Age (disabled)',
    column: 'age',
    actionConfig: false,
    // width: 120
  },
  {
    title: 'user id (number)',
    column: 'userID',
    actionConfig: {
      type: 'number',
      placeholder: 'Set userID',
      disabled: (data) => data?.level === 'level-1', // Disable this input if data.level === level-1. this shold return true or false
    }
  },
  {
    title: 'level (dropdown)',
    column: 'level',
    actionConfig: {
      type: 'dropdown',
      placeholder: 'Select level',
      schema: {
        type: "string",
        minLength: 1,
      },
      options: [{
        text: 'Level 1',
        value: 'level-1'
      }, {
        text: 'Level 2',
        value: 'level-2',
      }]
    }
  },
  {
    title: 'country (code-decod-dropdown)',
    column: 'country',
    width: 230,
    actionConfig: {
      type: CODE_DECODE_DROPDOWN,
      codeId: "COUNTRIES",
      placeholder: "Select country",
      disabled: (data) => data?.level === 'level-1', // Disable this input if data.level === level-1
    },
  },
  {
    title: 'is active (Checkbox)',
    column: 'isActive',
    type: 'isYesNo',
    actionConfig: {
      type: 'checkbox',
      text: 'Is user active?'
    }
  },
  {
    title: 'need device (radio)',
    column: 'needDevice',
    type: 'isYesNo',
    actionConfig: {
      type: 'radio',
      text: 'Is user need device?'
    }
  },
  {
    title: 'devices (Checkbox-group)',
    column: 'devices',
    width: 200,
    actionConfig: {
      type: 'checkbox-group',
      verticalAlign: true, // optional value to make checkbox-group to vertically align
      /** required if using 'checkbox-group' type */
      options: [{
        text: 'Laptop',
        value: 'laptop'
      }, {
        text: 'Mouse',
        value: 'mouse',
      }, {
        text: 'Keyboard',
        value: 'keyboard',
      }, {
        text: 'Monitor',
        value: 'monitor',
        disabled: true // example for disabling one option
      }]
    }
  },
  {
    title: 'On Leave (radio-group)',
    column: 'isOnLeave',
    actionConfig: {
      type: 'radio-group',
      verticalAlign: true, // optional value to make checkbox-group to vertically align
      /** required if using 'checkbox-group' type */
      options: [{
        text: 'On Leave',
        value: 'true'
      }, {
        text: 'At Office',
        value: 'false',
      }]
    }
  },
  {
    title: 'amount (tx-amount)',
    column: 'new.test.amount',
    type: 'tx-amount',
    width: 200,
    actionConfig: {
      type: 'tx-amount',
      schema: {
        type: "number",
        minimum: 1,
      }
    }
  },
  {
    title: 'nested amount (tx-amount)',
    column: 'amount',
    type: 'tx-amount',
    width: 200,
    actionConfig: {
      type: 'tx-amount',
      schema: {
        type: "number",
        minimum: 1,
      }
    }
  },
].map(i => ({
  ...i,
  /** remove column controls */
  // pinned: 'none',
  // sorted: 'none',
  // draggable: false,
  // resizable: false
}));

export const DOWNLOAD_COLUMN_SETTINGS = [
  {
    title: 'Name (regular text)',
    column: 'text',
    actionConfig: {
      type: "text",
      isUnique: true,
      schema: {
        type: "string",
        maxLength: 16,
        minLength: 8,
      }
    }
  },
  {
    title: 'Birthday (disable col. download)',
    column: 'birthdate',
    width: 230,
    disableDownload: true,
    actionConfig: {
      type: "date",
      isUnique: true,
    }
  },
  {
    title: 'user id (Disable col. upload)',
    column: 'userID',
    width: 210,
    disableUpload: true,
    actionConfig: {
      type: "number",
      isUnique: true,
    }
  },
  {
    title: 'level (with columnCustomRenderer)',
    column: 'level',
    width: 250,
    columnCustomRenderer: (_, data) => {
      return `${data?.country || '-'}-${data?.level || '-'}`
    }
  },
  {
    title: 'birthdate (columnCustomRenderer + date and time)',
    column: 'birthdate',
    width: 350,
    columnCustomRenderer: (text) => {
      const d = new Date();
      const time = `${d.getHours()}:${d.getMinutes()}`;
      /** Date value here from 'text' parameter is not formatted to what data-table default format because
       * 'text' parameter returns what the actual value from the column, in this case we use 'birthdate' column.
       * The 'birthdate' column have different date format and used it directly to render 'columnCustomRenderer'
      */
      return text ? `${text} ${time}` : '--';
    }
  },
  {
    title: 'ack created time (date + time)',
    column: 'acknowledgementCreatedTimestamp',
    width: 200,
    type: 'dateTime',
  },
  {
    title: 'ack created time (date + time + seconds)',
    column: 'acknowledgementCreatedTimestamp',
    width: 270,
    type: 'dateTimeSeconds',
  },
  {
    title: 'level (with columnCustomRenderer + element)',
    column: 'level',
    width: 320,
    columnCustomRenderer: (text, data) => {
      const devices = data?.devices?.split(',');
      /** 
       * If return value is a react component, then it cannot be downloaded in excel.
       * If this column is intended to include in excel download return an object with properties {render, downloadText}
       * render = this will render in data-table cell
       * downloadText = this will be use to download in excel. this should be a string, otherwise it will be blank in excel
       */
      return {
        render: <>{devices?.map(i => !!i ? <TxCoreButton key={i} size="xs" variation="primary">{i}</TxCoreButton> : null)}</>,
        downloadText: text, // This should always a string
      }
    }
  },
  {
    title: 'workflow stage',
    column: 'reqWorkflowStage',
    minWidth: "250px",
    align: 'left',
    columnCustomRenderer: (text) => {
      return (
        <ExceptionColumn>
          {text}
          {text && (
            <tx-core-icon
              icon="arrow-right"
              title="Go to transaction"
              onClick={() => {}}
              style={{ cursor: 'pointer' }}
            />
          )}
        </ExceptionColumn>
      )
    }
  },
].map(i => ({
  ...i,
  /** remove column controls */
  pinned: 'none',
  sorted: 'none',
  draggable: false,
  resizable: false
}));