# CRITICAL & HIGH ADVISORY DETAILS

Generated: 2026-08-20T05:09:33.651Z

Total packages with advisories: 177
Breakdown: {"info":0,"low":32,"moderate":89,"high":51,"critical":5,"total":177}

## [CRITICAL] next-auth
- **Direct dependency:** true
- **Advisory:** Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph @ bypass
- **CVSS:** N/A
- **CWE:** CWE-180
- **Affected range:** >=4.10.3 <4.24.15
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-7rqj-j65f-68wh

## [CRITICAL] next-auth
- **Direct dependency:** true
- **Advisory:** Auth.js: getToken() throws an uncaught exception on malformed Bearer authorization headers
- **CVSS:** 7.5
- **CWE:** CWE-20
- **Affected range:** >=4.0.6 <=4.24.14
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-xmf8-cvqr-rfgj

## [CRITICAL] next-auth
- **Direct dependency:** true
- **Advisory:** Auth.js: OAuth state, nonce, and PKCE check cookies are not bound to the provider that created them
- **CVSS:** 6.8
- **CWE:** CWE-345,CWE-346,CWE-940
- **Affected range:** <=4.24.14
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-x445-f3h2-j279

## [CRITICAL] vitest
- **Direct dependency:** true
- **Advisory:** When Vitest UI server is listening, arbitrary file can be read and executed
- **CVSS:** 9.8
- **CWE:** CWE-22,CWE-862
- **Affected range:** <3.2.6
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-5xrq-8626-4rwp

## [CRITICAL] @auth/core
- **Direct dependency:** false
- **Advisory:** Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph @ bypass
- **CVSS:** N/A
- **CWE:** CWE-180
- **Affected range:** >=0.1.0 <0.41.3
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-7rqj-j65f-68wh

## [CRITICAL] @auth/core
- **Direct dependency:** false
- **Advisory:** Auth.js: getToken() throws an uncaught exception on malformed Bearer authorization headers
- **CVSS:** 7.5
- **CWE:** CWE-20
- **Affected range:** >=0.1.0 <0.41.3
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-xmf8-cvqr-rfgj

## [CRITICAL] @auth/core
- **Direct dependency:** false
- **Advisory:** Auth.js: OAuth state, nonce, and PKCE check cookies are not bound to the provider that created them
- **CVSS:** 6.8
- **CWE:** CWE-345,CWE-346,CWE-940
- **Affected range:** <=0.41.2
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-x445-f3h2-j279

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Denial of Service in App Router using Server Actions
- **CVSS:** N/A
- **CWE:** CWE-834
- **Affected range:** >=13.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-m99w-x7hq-7vfj

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Server-Side Request Forgery in Server Actions on custom servers
- **CVSS:** N/A
- **CWE:** CWE-918
- **Affected range:** >=14.1.1 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-89xv-2m56-2m9x

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Cache confusion of response bodies for requests with bodies
- **CVSS:** N/A
- **CWE:** CWE-524
- **Affected range:** >=13.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-68g3-v927-f742

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Cache confusion of response bodies for requests with bodies containing invalid UTF-8 byte sequences
- **CVSS:** N/A
- **CWE:** CWE-116
- **Affected range:** >=13.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-4633-3j49-mh5q

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Unbounded Server Action payload in Edge runtime
- **CVSS:** N/A
- **CWE:** CWE-770
- **Affected range:** >=13.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-4c39-4ccg-62r3

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Server-Side Request Forgery in rewrites via attacker-controlled destination hostname
- **CVSS:** N/A
- **CWE:** CWE-918
- **Affected range:** >=12.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-p9j2-gv94-2wf4

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Denial of Service in the Image Optimization API using SVGs
- **CVSS:** N/A
- **CWE:** CWE-407
- **Affected range:** >=15.5.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-q8wf-6r8g-63ch

## [HIGH] next
- **Direct dependency:** true
- **Advisory:** Next.js: Unauthenticated disclosure of internal Server Function endpoints
- **CVSS:** N/A
- **CWE:** CWE-201
- **Affected range:** >=13.0.0 <15.5.21
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-955p-x3mx-jcvp

## [HIGH] postcss
- **Direct dependency:** true
- **Advisory:** PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset
- **CVSS:** N/A
- **CWE:** CWE-22,CWE-200
- **Affected range:** <=8.5.22
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-fxqj-rqcc-2cmp

## [HIGH] postcss
- **Direct dependency:** true
- **Advisory:** PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure
- **CVSS:** 7.5
- **CWE:** CWE-22
- **Affected range:** <=8.5.17
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-r28c-9q8g-f849

## [HIGH] sharp
- **Direct dependency:** true
- **Advisory:** sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
- **CVSS:** N/A
- **CWE:** CWE-1395
- **Affected range:** <0.35.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-f88m-g3jw-g9cj

## [HIGH] @coinbase/wallet-sdk
- **Direct dependency:** false
- **Advisory:** Unknown vulnerability in Coinbase Wallet SDK
- **CVSS:** N/A
- **CWE:** N/A
- **Affected range:** >=4.0.0-beta.0 <4.3.0
- **Fix available:** NO
- **URL:** https://github.com/advisories/GHSA-8rgj-285w-qcq4

## [HIGH] @opentelemetry/propagator-jaeger
- **Direct dependency:** false
- **Advisory:** OpenTelemetry JavaScript: Denial of service in `JaegerPropagator` via unhandled exception on a malformed header
- **CVSS:** 7.5
- **CWE:** CWE-248
- **Affected range:** <2.9.0
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-45rx-2jwx-cxfr

## [HIGH] adm-zip
- **Direct dependency:** false
- **Advisory:** adm-zip: Crafted ZIP file triggers 4GB memory allocation
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-789
- **Affected range:** <0.6.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-xcpc-8h2w-3j85

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF
- **CVSS:** 4.8
- **CWE:** CWE-441,CWE-918
- **Affected range:** >=1.0.0 <1.15.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-3p68-rc4w-qgx5

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy
- **CVSS:** 4.8
- **CWE:** CWE-287,CWE-1321
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-w9j2-pvgh-6h63

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0
- **CVSS:** 7.2
- **CWE:** CWE-183,CWE-441,CWE-918
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-pmwg-cvhr-8vh7

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `parseReviver`
- **CVSS:** 6.5
- **CWE:** CWE-915,CWE-1321
- **Affected range:** >=1.0.0 <1.15.2
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-3w6x-2g7m-8v23

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams
- **CVSS:** 3.7
- **CWE:** CWE-116,CWE-626
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-xhjh-pmcv-23jw

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream
- **CVSS:** 5.3
- **CWE:** CWE-93
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-445q-vr5w-6q77

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: no_proxy bypass via IP alias allows SSRF
- **CVSS:** 6.8
- **CWE:** CWE-918
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-m7pr-hjqh-92cm

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0
- **CVSS:** 5.3
- **CWE:** CWE-770
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-5c9x-8gcm-mpgx

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: HTTP adapter streamed responses bypass maxContentLength
- **CVSS:** 5.3
- **CWE:** CWE-770
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-vf2m-468p-8v99

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking
- **CVSS:** 7.4
- **CWE:** CWE-1321
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-pf86-5x62-jrwf

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Header Injection via Prototype Pollution
- **CVSS:** 7.4
- **CWE:** CWE-113,CWE-1321
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-6chq-wfr3-2hj9

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion
- **CVSS:** 5.4
- **CWE:** CWE-183,CWE-201
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-xx6v-rp6x-q39c

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios has prototype pollution read-side gadgets in HTTP adapter that allow credential injection and request hijacking
- **CVSS:** 7.4
- **CWE:** CWE-1321
- **Affected range:** >=1.0.0 <1.15.2
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-q8qp-cvcw-x6jj

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain
- **CVSS:** 4.8
- **CWE:** CWE-113,CWE-444,CWE-918
- **Affected range:** >=1.0.0 <1.15.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-fvcv-3m26-pcqx

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: unbounded recursion in toFormData causes DoS via deeply nested request data
- **CVSS:** 7.5
- **CWE:** CWE-674
- **Affected range:** >=1.0.0 <1.15.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-62hf-57xw-28j9

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-1333
- **Affected range:** >=1.0.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-hfxv-24rg-xrqf

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Allocation of Resources Without Limits or Throttling in Axios
- **CVSS:** 7.5
- **CWE:** CWE-770
- **Affected range:** >=1.7.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-777c-7fjr-54vf

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter
- **CVSS:** N/A
- **CWE:** CWE-201
- **Affected range:** >=1.0.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-p92q-9vqr-4j8v

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection
- **CVSS:** 7.5
- **CWE:** CWE-200
- **Affected range:** >=1.0.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-j5f8-grm9-p9fc

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge
- **CVSS:** 7
- **CWE:** CWE-94,CWE-1321
- **Affected range:** >=1.0.0 <1.15.2
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-3g43-6gmg-66jw

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy`
- **CVSS:** 8.7
- **CWE:** CWE-441,CWE-1321
- **Affected range:** >=1.0.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-35jp-ww65-95wh

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions
- **CVSS:** 4.8
- **CWE:** CWE-1321
- **Affected range:** >=1.0.0 <1.16.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-898c-q2cr-xwhg

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Excessive recursion in formDataToJSON can cause denial of service
- **CVSS:** N/A
- **CWE:** CWE-400,CWE-674
- **Affected range:** >=1.0.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-42h9-826w-cgv3

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Deep formToJSON Key Recursion Can Cause Denial of Service
- **CVSS:** N/A
- **CWE:** CWE-400,CWE-770
- **Affected range:** >=1.0.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-pmv8-rq9r-6j72

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Fetch adapter `ReadableStream` uploads bypass `maxBodyLength`
- **CVSS:** N/A
- **CWE:** CWE-770
- **Affected range:** >=1.7.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-jqh4-m9w3-8hp9

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Prototype pollution gadgets can alter axios request construction
- **CVSS:** N/A
- **CWE:** CWE-1321
- **Affected range:** >=1.0.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-mmx7-hfxf-jppx

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: NO_PROXY bypass for 0.0.0.0 local addresses in axios
- **CVSS:** N/A
- **CWE:** CWE-183,CWE-918
- **Affected range:** >=1.15.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-f4gw-2p7v-4548

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios Node HTTP adapter can use an inherited proxy after interceptor config cloning
- **CVSS:** N/A
- **CWE:** CWE-200,CWE-1321
- **Affected range:** >=1.15.2 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-gcfj-64vw-6mp9

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios form serializer maxDepth bypass via {} metatoken
- **CVSS:** N/A
- **CWE:** CWE-674
- **Affected range:** >=1.15.1 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-hcpx-6fm6-wx23

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Nested axios option objects can consume polluted prototype values
- **CVSS:** N/A
- **CWE:** CWE-1321
- **Affected range:** >=1.0.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-7q8q-rj6j-mhjq

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: HTTP/2 streamed uploads bypass `maxBodyLength`
- **CVSS:** N/A
- **CWE:** CWE-400
- **Affected range:** >=1.13.0 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-mwf2-3pr3-8698

## [HIGH] axios
- **Direct dependency:** false
- **Advisory:** Axios: Prototype pollution auth subfields can inject Basic auth
- **CVSS:** N/A
- **CWE:** CWE-1321
- **Affected range:** >=1.15.2 <1.18.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-xj6q-8x83-jv6g

## [HIGH] brace-expansion
- **Direct dependency:** false
- **Advisory:** brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups
- **CVSS:** 5.3
- **CWE:** CWE-400,CWE-407
- **Affected range:** >=2.0.0 <2.1.2
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-3jxr-9vmj-r5cp

## [HIGH] brace-expansion
- **Direct dependency:** false
- **Advisory:** brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-770
- **Affected range:** >=2.0.0 <2.1.3
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-mh99-v99m-4gvg

## [HIGH] brace-expansion
- **Direct dependency:** false
- **Advisory:** brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-770
- **Affected range:** >=2.0.0 <2.1.4
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-rgw5-rvv9-x895

## [HIGH] d3-color
- **Direct dependency:** false
- **Advisory:** d3-color vulnerable to ReDoS
- **CVSS:** N/A
- **CWE:** CWE-400,CWE-1333
- **Affected range:** >=1.0.2 <3.1.0
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-36jr-mh4h-2g58

## [HIGH] deepmerge-ts
- **Direct dependency:** false
- **Advisory:** DeepmergeTS has stack exhaustion when merging recursive object graphs
- **CVSS:** N/A
- **CWE:** CWE-674
- **Affected range:** <8.0.0
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-ggr8-5vv4-36mx

## [HIGH] extract-zip
- **Direct dependency:** false
- **Advisory:** extract-zip unvalidated symlink path traversal
- **CVSS:** 8.1
- **CWE:** CWE-22
- **Affected range:** <=2.0.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-jmr9-qjv8-65gv

## [HIGH] fast-uri
- **Direct dependency:** false
- **Advisory:** fast-uri vulnerable to host confusion via literal backslash authority delimiter
- **CVSS:** 7.5
- **CWE:** CWE-436
- **Affected range:** >=3.0.0 <=3.1.3
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-v2hh-gcrm-f6hx

## [HIGH] fast-uri
- **Direct dependency:** false
- **Advisory:** fast-uri vulnerable to host confusion via backslash authority introducer
- **CVSS:** 7.5
- **CWE:** CWE-436
- **Affected range:** >=3.0.0 <3.1.5
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-7p8r-x3mc-p8w7

## [HIGH] fast-uri
- **Direct dependency:** false
- **Advisory:** fast-uri vulnerable to host confusion via failed IDN canonicalization
- **CVSS:** 7.5
- **CWE:** CWE-436,CWE-551
- **Affected range:** >=3.0.0 <3.1.3
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-4c8g-83qw-93j6

## [HIGH] glob
- **Direct dependency:** false
- **Advisory:** glob CLI: Command injection via -c/--cmd executes matches with shell:true
- **CVSS:** 7.5
- **CWE:** CWE-78
- **Affected range:** >=10.2.0 <10.5.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-5j98-mcp5-4vw2

## [HIGH] immutable
- **Direct dependency:** false
- **Advisory:** Immutable.js `List` 32-bit trie overflow → unrecoverable DoS
- **CVSS:** 7.5
- **CWE:** CWE-190,CWE-400,CWE-835,CWE-1284
- **Affected range:** >=5.0.0-beta.1 <5.1.8
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-v56q-mh7h-f735

## [HIGH] immutable
- **Direct dependency:** false
- **Advisory:** Immutable: Hash-collision algorithmic complexity denial of service in Immutable.Map/Set
- **CVSS:** N/A
- **CWE:** CWE-400,CWE-407
- **Affected range:** >=5.0.0-beta.1 <5.1.8
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-xvcm-6775-5m9r

## [HIGH] ip-address
- **Direct dependency:** false
- **Advisory:** ip-address has XSS in Address6 HTML-emitting methods
- **CVSS:** N/A
- **CWE:** CWE-79
- **Affected range:** <=10.1.0
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

## [HIGH] ip-address
- **Direct dependency:** false
- **Advisory:** ip-address: Address4 decodes leading-zero octets as decimal while resolvers decode them as octal, allowing SSRF and trust-boundary bypass
- **CVSS:** N/A
- **CWE:** CWE-20,CWE-918
- **Affected range:** <=10.3.0
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-mwp4-54f8-5fhr

## [HIGH] js-yaml
- **Direct dependency:** false
- **Advisory:** js-yaml: YAML merge-key chains can force quadratic CPU consumption
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-407
- **Affected range:** >=4.0.0 <4.3.0
- **Fix available:** NO
- **URL:** https://github.com/advisories/GHSA-52cp-r559-cp3m

## [HIGH] js-yaml
- **Direct dependency:** false
- **Advisory:** JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported
- **CVSS:** 7.5
- **CWE:** CWE-407
- **Affected range:** >=4.0.0 <4.3.1
- **Fix available:** NO
- **URL:** https://github.com/advisories/GHSA-5p4m-2wfm-xmqj

## [HIGH] lodash
- **Direct dependency:** false
- **Advisory:** lodash vulnerable to Code Injection via `_.template` imports key names
- **CVSS:** 8.1
- **CWE:** CWE-94
- **Affected range:** >=4.0.0 <=4.17.23
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-r5fr-rjxr-66jc

## [HIGH] lodash
- **Direct dependency:** false
- **Advisory:** lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`
- **CVSS:** 6.5
- **CWE:** CWE-1321
- **Affected range:** <=4.17.23
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-f23m-r3pf-42rh

## [HIGH] lodash
- **Direct dependency:** false
- **Advisory:** Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions
- **CVSS:** 6.5
- **CWE:** CWE-1321
- **Affected range:** >=4.0.0 <=4.17.22
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-xxjr-mmjv-4gpg

## [HIGH] nanoid
- **Direct dependency:** false
- **Advisory:** nanoid: non-secure generators can loop indefinitely with negative size
- **CVSS:** 5.9
- **CWE:** CWE-835
- **Affected range:** <3.3.16
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-28wg-ghj8-5hjv

## [HIGH] nanoid
- **Direct dependency:** false
- **Advisory:** nanoid: custom generators can loop indefinitely when size is zero
- **CVSS:** 5.9
- **CWE:** CWE-835
- **Affected range:** <3.3.18
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-2v37-7h3g-55p8

## [HIGH] serialize-javascript
- **Direct dependency:** false
- **Advisory:** Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()
- **CVSS:** 8.1
- **CWE:** CWE-96
- **Affected range:** <=7.0.2
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-5c6j-r48x-rmvq

## [HIGH] serialize-javascript
- **Direct dependency:** false
- **Advisory:** Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects
- **CVSS:** 5.9
- **CWE:** CWE-400,CWE-834
- **Affected range:** >=5.0.0 <7.0.5
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-qj8w-gfj5-8c6v

## [HIGH] shell-quote
- **Direct dependency:** false
- **Advisory:** shell-quote: Quadratic-complexity Denial of Service in `parse()` (CWE-407)
- **CVSS:** 7.5
- **CWE:** CWE-407
- **Affected range:** <=1.8.4
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-395f-4hp3-45gv

## [HIGH] socket.io-parser
- **Direct dependency:** false
- **Advisory:** Socket.IO: Zero-attachment Memory Exhaustion
- **CVSS:** 7.5
- **CWE:** CWE-20,CWE-754
- **Affected range:** >=4.0.0 <4.2.7
- **Fix available:** YES (non-breaking)
- **URL:** https://github.com/advisories/GHSA-2m8v-j782-fhvr

## [HIGH] ws
- **Direct dependency:** false
- **Advisory:** ws: Uninitialized memory disclosure
- **CVSS:** 4.4
- **CWE:** CWE-908
- **Affected range:** >=8.0.0 <8.20.1
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-58qx-3vcg-4xpx

## [HIGH] ws
- **Direct dependency:** false
- **Advisory:** ws: Memory exhaustion DoS from tiny fragments and data chunks
- **CVSS:** 7.5
- **CWE:** CWE-400,CWE-770,CWE-1050
- **Affected range:** >=8.0.0 <8.21.0
- **Fix available:** YES (major version bump)
- **URL:** https://github.com/advisories/GHSA-96hv-2xvq-fx4p

