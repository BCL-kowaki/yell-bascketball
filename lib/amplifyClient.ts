"use client"

import { Amplify } from "aws-amplify"
import config from "../src/amplifyconfiguration.json"

let isConfigured = false

export function ensureAmplifyConfigured(): void {
  if (!isConfigured) {
    Amplify.configure(config, { ssr: true })
    isConfigured = true
  }
}


