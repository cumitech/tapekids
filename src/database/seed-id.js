"use strict";

const { customAlphabet } = require("nanoid");

const RECORD_ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const RECORD_ID_LENGTH = 20;
const TOKEN_ID_LENGTH = 48;

const PAYMENT_TRACKING_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const PAYMENT_TRACKING_SUFFIX_LENGTH = 9;

const createRecordId = customAlphabet(RECORD_ID_ALPHABET, RECORD_ID_LENGTH);
const createTokenId = customAlphabet(RECORD_ID_ALPHABET, TOKEN_ID_LENGTH);
const createPaymentTrackingSuffix = customAlphabet(
  PAYMENT_TRACKING_ALPHABET,
  PAYMENT_TRACKING_SUFFIX_LENGTH
);

function recordId() {
  return createRecordId();
}

function tokenId() {
  return createTokenId();
}

function paymentTrackingId() {
  return `PAY${createPaymentTrackingSuffix()}`;
}

module.exports = {
  RECORD_ID_ALPHABET,
  RECORD_ID_LENGTH,
  recordId,
  tokenId,
  paymentTrackingId,
};
