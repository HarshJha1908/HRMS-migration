# HRMS Migration Frontend

HRMS Migration is a frontend-focused React application for employee HR self-service and manager/HR leave administration. The code in this repository is a Vite single-page application (SPA) that authenticates users with Microsoft Entra ID, renders HRMS pages in the browser, and treats the backend as an external `/api/*` data provider.

This README intentionally documents the frontend implementation and how it reads from and sends data to backend APIs. It does not document backend internals, database design, controllers, services, or deployment beyond what the frontend needs to connect to those APIs.

## Frontend Feature Overview

The frontend includes these user-facing areas:

- **Authenticated HRMS shell** with a common navbar, routed content area, footer, page skeletons, and an Entra ID sign-in gate.
- **Employee workspace** for viewing and editing profile/contact information, updating insurance nominations, applying for leave, viewing leave balances, leave history, holidays, leave rules, and HR policy/document resources.
- **Manager flows** for pending leave approvals, approval history, team leave details, and summary reports. Manager menu items are shown from frontend role flags returned by the login-user API.
- **HR administration flows** for profile creation/update, employee search, quick exports, special leave assignment/removal/export, document management, exception leave, and exit leave adjustment. Admin menu items are shown from frontend role flags returned by the login-user API.
- **Document center** for browsing document types, loading documents by type, previewing files, searching, and adding/updating documents.
- **Reporting/export utilities** for PDF/CSV exports backed by report APIs and frontend export utilities.

## Frontend Technology Stack

| Area | Technology used |
| --- | --- |
| UI framework | React 19 with TypeScript |
| Build tool | Vite 7 with `@vitejs/plugin-react` |
| Routing | `react-router-dom` 7 `BrowserRouter`, `Routes`, nested layout routes, route params, `Link` navigation |
| Authentication | `@azure/msal-browser` and `@azure/msal-react` for Microsoft Entra ID redirect/silent SSO flows |
| Styling | Plain CSS files imported next to pages/components plus global `src/index.css` |
| HTTP/API | Browser `fetch` wrapped by `src/services/apiClient.ts` and endpoint functions in `src/services/apiService.ts` |
| State | React local state/hooks plus `UserContext` for authenticated user metadata and frontend role flags |
| Documents/PDF/export | `react-pdf`, `jspdf`, `jspdf-autotable`, CSV/PDF utilities under `src/utils/` |
| Date inputs | `react-datepicker` |
| Icons | Font Awesome React packages |
| Linting/type checks | ESLint, TypeScript project build via `tsc -b` |

No frontend test script is currently defined in `package.json`.

## Frontend Architecture

```text
src/main.tsx
  ↓ initializes MSAL and renders providers
<MsalProvider>
  ↓
<BrowserRouter>
  ↓
<App>
  ↓
<AuthGate> ensures Entra session exists
  ↓
<UserProvider> loads frontend role/user metadata from /api/Me/GetLoginUserInfoByUserid
  ↓
<Routes> with MainLayout
  ↓
Navbar + routed page/component + Footer
  ↓
Page/component local state, hooks, forms, utilities
  ↓
src/services/apiService.ts endpoint functions
  ↓
src/services/apiClient.ts fetch wrapper
  ↓
Backend /api/* endpoints
```

Important implementation points:

- `src/main.tsx` creates the React root, awaits `initializeMsal()`, and then renders `MsalProvider`, `BrowserRouter`, and `App`.
- `src/App.tsx` lazy-loads pages/components, wraps all routes in `AuthGate` and `UserProvider`, and places routed pages under `MainLayout`.
- `src/layouts/MainLayout.tsx` provides the shared navbar, `<Outlet />`, and footer.
- `src/components/Navbar 1.tsx` uses `useUser()` role flags to show manager/admin menus and uses `Link` for SPA navigation.
- Most pages/components own their own local `useState` loading, error, form, pagination, and table data state. Shared authenticated-user metadata is held in `src/context/UserContext.tsx`.
- `src/services/apiService.ts` contains the frontend service layer. It creates request URLs/payloads, normalizes some responses, and returns typed data to pages/components.
- `src/services/apiClient.ts` centralizes base URL resolution, bearer-token attachment, JSON/body parsing, GET caching, non-GET cache invalidation, and standard API error creation.

## Project Structure

```text
.
├── README.md                         # Frontend-focused project documentation
├── index.html                        # Vite HTML entry point
├── package.json                      # Frontend dependencies and scripts
├── vite.config.ts                    # Vite config and local /api proxy
├── public/
│   ├── Linde_plc_logo.png            # Static branding asset
│   ├── image.webp                    # Static frontend image asset
│   └── web.config                    # IIS/static hosting and reverse-proxy support
└── src/
    ├── main.tsx                      # React/MSAL/router bootstrap
    ├── App.tsx                       # Lazy route configuration and providers
    ├── auth/                         # Entra ID/MSAL config, auth gate, token service, auth hook
    ├── context/UserContext.tsx       # User metadata and role flags shared across frontend
    ├── layouts/                      # Main layout and loading screen
    ├── pages/                        # Route-level screens
    ├── components/                   # Reusable and feature components
    ├── admin/                        # Admin/manager approval screen
    ├── services/                     # API client and endpoint functions
    ├── hooks/                        # Custom API-loading hooks
    ├── types/                        # Frontend API and prop types
    ├── utils/                        # CSV/PDF/date/helper utilities
    └── config/hrResources.ts         # HR resource links/menu configuration
```

## Routing

Routes are defined in `src/App.tsx` and rendered inside `MainLayout` after authentication succeeds.

| Route | Rendered frontend module | Purpose |
| --- | --- | --- |
| `/` | `pages/HomePage` | HRMS landing page |
| `/leave-tool-home` | `pages/LeaveToolHome` | Leave tool landing page |
| `/apply-leave` | `pages/ApplyLeave` | Apply for own leave through `LeaveForm` |
| `/apply-leave-for-others` | `pages/ApplyLeaveForOthers` | Apply leave for another employee after employee lookup |
| `/leave-details` | `pages/LeaveDetails` | Current user's leave history/details |
| `/leave-balance` | `components/LeaveBalance` | Leave balance dashboard/details |
| `/leave-rules` | `pages/LeaveRules` | Leave rule list |
| `/holiday-list` | `components/HolidayList` | Holiday list |
| `/my-profile` | `components/Myprofile` | View profile and update emergency contacts |
| `/insurance` | `components/Insurance` | Insurance nomination update flow |
| `/pending-approval` | `admin/PendingApproval` | Manager pending approvals |
| `/team-leave-details` | `pages/TeamLeaveDetails` | Manager team leave history |
| `/summary-report` | `components/SummaryReport` | Manager/HR summary reports |
| `/quick-export` | `components/QuickExport` | HR quick export reports |
| `/profile` | `components/EmployeeProfile` | Create/update employee profile |
| `/single-search` | `components/SingleSearch` | HR employee search |
| `/single-search/details` | `pages/SingleSearchDetails` | HR employee detail/action page |
| `/single-search/create-exception` | `pages/SingleSearchCreateException` | Create leave exception for searched employee |
| `/single-search/exit-leave-adjustment` | `pages/ExitLeaveAdjustment` | Exit leave adjustment calculation/update |
| `/special-leave-entry` | `pages/SpecialLeaveEntry` | Special leave assignment/removal/export |
| `/documents` | `pages/ViewDocuments` | Document center |
| `/documents/:documentType` | `pages/ViewDocuments` | Document center filtered by document type route param |
| `/leave-view` | `pages/ViewEmployeeLeave` | Leave detail view wrapper |
| `/leave-view/:leaveId` | `pages/ViewEmployeeLeave` | Leave detail by leave ID |
| `/leave-view/:leaveId/:adId` | `pages/ViewEmployeeLeave` | Leave detail by leave ID and employee AD ID |
| `/download-center` | `components/DownLoadCenter` | Download center reports |
| `/locked` | `components/LockedScreen` | Locked/unavailable placeholder |
| `*` | inline 404 | Not found page |

The route guard is frontend-wide: `AuthGate` wraps the entire route tree rather than individual routes. Manager/admin visibility is controlled in the navbar by role flags from `UserContext`; routes themselves are still declared in `App.tsx`.

## State Management

The application uses React state primitives rather than Redux/Zustand/React Query.

- **Authentication state** comes from MSAL via `useMsal()`/`useIsAuthenticated()` and is exposed to components through `useAuth()`.
- **Global frontend user metadata** is stored in `UserContext`. Once an Entra account is known, `UserProvider` calls `getLoginUserInfoByUserid(user.loginUserAdID)`, stores `userInfo`, and derives `isManager` and `isAdmin` flags for menus/pages.
- **API/page data** is usually local to the page/component that fetched it: arrays for tables, form objects, selected rows, pagination, loading booleans, success messages, and error strings.
- **Reusable loading hooks** exist for holidays and leave status codes. `useHolidays()` loads `/api/HolidayList/GetAllHolidayList`; `useLeaveStatusCodes()` loads `/api/Leave/GetLeaveStatusCode` and normalizes status code/name strings.
- **API GET cache** is in `apiClient.ts`. GET responses are cached for two minutes and in-flight identical GET requests are deduplicated. Any non-GET request clears the GET cache.

## Authentication: Frontend Perspective

Authentication is implemented only on the frontend through MSAL/Entra ID:

1. `authConfig.ts` reads Vite environment variables for client ID, tenant ID, redirect URIs, and API scope.
2. `msalInstance.ts` initializes `PublicClientApplication`, handles redirect responses, and sets/updates the active account after login or token acquisition events.
3. `AuthGate.tsx` blocks rendering until a user is authenticated. It first attempts `ssoSilent()` and falls back to `loginRedirect()` when interaction is required or no silent session is available.
4. `useAuth.ts` derives `username`, display name, object ID, UPN, and `loginUserAdID` from the active account/claims. `loginUserAdID` is the UPN local-part and is used by many HRMS APIs as the frontend user identifier.
5. `tokenService.ts` silently acquires an access token for `VITE_AAD_API_SCOPE`; if interaction is required it redirects for token acquisition.
6. `apiClient.ts` attaches `Authorization: Bearer <token>` to relative `/api/*` calls and avoids attaching that token to non-API absolute URLs.

The SPA stores MSAL cache data in `sessionStorage`. Do not put client secrets in frontend configuration; the SPA only uses public client settings and access scopes.

## API / Backend Integration

### API Client Behavior

`src/services/apiClient.ts` is the shared HTTP wrapper used by most endpoint functions:

- `VITE_API_BASE_URL` is trimmed and prepended to relative URLs when set. If it is blank, calls remain relative, for example `/api/Leave/GetLeaveBalance`.
- JSON requests receive `Content-Type: application/json`; `FormData` requests intentionally do not set that header so the browser can create the multipart boundary.
- Relative API calls receive an Entra bearer token from `getApiAccessToken()`.
- Responses with JSON content are parsed as JSON; other responses are parsed as text unless a specialized service fetches a `Blob`.
- Non-OK responses throw an `Error` with the backend `message` field when available and attach `status`/`responseBody` for callers.
- GET requests are cached for two minutes; non-GET requests invalidate the GET cache.
- The client detects `/api/` responses that look like SPA HTML fallback and throws a reverse-proxy configuration error instead of returning HTML as data.

Some file endpoints (`getLeaveAttachment`, `getDocumentFile`, `addDocument`, `updateDocument`) use direct `fetch()` because they need blob or multipart handling. `getLeaveAttachment` adds the bearer token itself; document file/add/update calls currently use `resolveApiUrl()` directly and do not go through the common token wrapper.

### Important Frontend Service Functions

| Frontend function | Method | Backend endpoint | Sends | Receives/processing | Used by |
| --- | --- | --- | --- | --- | --- |
| `getLoginUserInfoByUserid` | GET | `/api/Me/GetLoginUserInfoByUserid?userid=...` | user AD ID query | `LoginUserInfo` role/profile flags | `UserProvider` |
| `getLeaveTypes` | GET | `/api/Leave/GetLeaveType?userid=...` | user AD ID query | leave type list | `LeaveForm`, leave detail filters |
| `getLeaveBalance` | GET | `/api/Leave/GetLeaveBalance?userid=...` | user AD ID query | `LeaveBalanceResponse`; normalizes alternate balance field names | `LeaveBalance` |
| `getLeaveStatusCodes` | GET | `/api/Leave/GetLeaveStatusCode` | none | leave status list, normalized by hook | leave status filters/forms |
| `getNoOfDays` | GET | `/api/Leave/GetNoOfWorkingDaysFromStartandEndDate?...` | start date, end date, leave type, half-day count query params | working-day count | `LeaveForm` |
| `saveLeaveRequest` | POST | `/api/Leave/SaveLeaveRequest` | JSON leave request payload | save response, leave ID extracted by form when present | `LeaveForm` |
| `saveLeaveRequestAttachment` | POST | `/api/Leave/SaveLeaveRequestAttachment` | `FormData` with `leaveId` and `file` | attachment save response | `LeaveForm` |
| `getLeaveDetails` | POST | `/api/Leave/GetAllLeaveRequestDetailsByEmpAdId` | JSON filters: year, AD ID, leave type code, status | leave request rows | `MyLeaveDetail`, employee detail pages |
| `getLeaveAttachment` | GET | `/api/Leave/GetLeaveAttachment?leaveID=...` | leave ID query | blob plus filename, from binary response or base64 JSON payload | leave detail/view components |
| `getViewLeaveDetailsByLeaveId` | GET | `/api/Leave/GetLeaveRequestDetailsByLeaveId?LeaveId=...&loginADId=...` | leave ID and login AD ID query | single leave details | `ViewLeave` |
| `savePendingLeaveRequestByOneLeaveId` | POST | `/api/Leave/SavePendingLeaveRequestByOneLeaveId` | JSON `{ leaveId, status, remarks }` | mutation response | leave cancel/action screens |
| `getPendingApprovals` | GET | `/api/Leave/GetAllPendingLeaveRequestByManagerId?userid=...` | manager AD ID query | pending approval rows; throws when `isSuccess` is false | `PendingApproval` |
| `bulkApproveReject` | POST | `/api/Leave/SavePendingLeaveRequestByLeaveId` | JSON array of `{ leaveId, status, remarks }` | mutation response | `PendingApproval` |
| `getAllTeamMembersByManagerId` | GET | `/api/Employee/GetAllTeamMembersByManagerId?UserAdID=...` | manager AD ID query | team member list | manager pages |
| `getAllLeaveRequestByManagerId` | GET | `/api/Leave/GetAllLeaveRequestByManagerId?userid=...` | manager AD ID query | team leave request rows | `TeamLeaveDetails` |
| `getEmpProfileByAdId` / `getEmpProfileByEmpId` | GET | `/api/ManageProfile/GetEmpProfileByADId?...`, `/api/ManageProfile/GetEmpProfileByEmpId?...` | AD ID or employee number query | employee profile object; unwraps `data` when present | profile/search/insurance flows |
| `saveNewEmpProfile` / `updateEmpProfile` | POST | `/api/ManageProfile/SaveNewEmpProfile`, `/api/ManageProfile/UpdateEmployeeProfile` | `SaveNewEmployeeProfileRequest` JSON | mutation response | `EmployeeProfile` |
| `updateEmergencyContactDetails` | POST | `/api/ManageProfile/UpdateEmergencyContactDetails` | `UpdateEmergencyContactRequest` JSON | `ApiMutationResponse` | `Myprofile` |
| `getEmployeeByKeyword` | GET | `/api/Employee/GetEmployeeDetailsBySingleSearch?keyword=...` | search query | employee search results; throws on unsuccessful response | `SingleSearch` |
| `getExitLeaveAdjustmentCalculation` | GET | `/api/Employee/GetExitLeaveAdjustmentCalculation?userid=...&ExitDate=...` | user AD ID and date query; frontend converts `yyyy-mm-dd` to `dd/mm/yyyy` | calculation data | `ExitLeaveAdjustment` |
| `updateExitLeaveAdjustment` | POST | `/api/Employee/UpdateExitLeaveAdjustment` | `UpdateExitLeaveAdjustmentRequest` JSON | update response | `ExitLeaveAdjustment` |
| `getAllLeaveExceptionsByEmployee` | GET | `/api/LeaveException/GetAllLeaveExceptionsByEmployee?employeeId=...` | employee ID query | leave exception rows | exception flow |
| `addLeaveException` | POST | `/api/LeaveException/AddLeaveException` | `AddLeaveExceptionRequest` JSON | add response | exception flow |
| `getAllSpecialLeaveTypes` | GET | `/api/LeaveType/GetAllSpecialLeaveType` | none | normalized active leave type list | `SpecialLeaveEntry` |
| `getSpecialLeavesByLeaveTypeCodeYear` | GET | `/api/SpecialLeaves/GetSpecialLeavesByLeaveTypeCodeYear?...` | leave type and year query | special leave rows; tries query-name variants | `SpecialLeaveEntry` |
| `addBulkSpecialLeaveRequest` | POST | `/api/SpecialLeaves/AddBulkSpecialLeaveRequest` | normalized JSON array of special leave entries | bulk add response | `SpecialLeaveEntry` |
| `deactivateBulkSpecialLeavesRequest` | POST | `/api/SpecialLeaves/DeactivateBulkSpecialLeavesRequest` | selected special leave rows JSON | deactivate response | `SpecialLeaveEntry` |
| `getDocumentTypes` | GET | `/api/Documents/GetDocumentType` | none | active document type list | `DocumentViewer` |
| `getDocuments` / `searchDocuments` | GET | `/api/Documents/GetAllDocuments?type=...`, `/api/Documents/SearchDocuments?searchString=...` | type or search query | normalized document rows | `DocumentViewer` |
| `getDocumentFile` | GET | `/api/Documents/GetDocumentFile?DocID=...` | document ID query | file `Blob`; rejects unexpected content types | `DocumentViewer` |
| `addDocument` / `updateDocument` | POST | `/api/Documents/AddDocument`, `/api/Documents/UpdateDocument` | multipart `FormData` fields and optional file | JSON mutation response | `DocumentViewer` |
| `getInsuranceRelations` | GET | `/api/Insurance/GetInsuranceRelation?InsuranceCode=...` | insurance type/code query | relation list; throws on unsuccessful response | `Insurance` |
| `getInsuranceChildMaxAge` | GET | `/api/Insurance/GetInsuranceChildMaxAge` | none | numeric max child age | `Insurance` |
| `getInsuranceNominationDetails` | GET | `/api/Insurance/GetInsuranceNominationDetails?InsuranceCode=...&Userid=...` | insurance code and user ID query | nomination details | `Insurance` |
| `manageInsuranceNominationDetails` | POST | `/api/Insurance/ManageInsuranceNominationDetails?reason=...&empnumber=...&Adidforother=...` | reason/employee query params plus nominee JSON array | mutation response | `Insurance` |
| Report functions | GET | `/api/Report/...` endpoints | report filters in query string | arrays normalized for PDF/CSV/table exports | `QuickExport`, `DownLoadCenter`, `SummaryReport` |

## Frontend Data Flow

### Reading Data

Typical read flow:

```text
Page/component mounts or user changes filter
  ↓
Component validates required identifiers/filters
  ↓
Component calls a service function from src/services/apiService.ts
  ↓
Service builds query string or request options
  ↓
apiClient resolves base URL and attaches bearer token
  ↓
Backend /api endpoint returns JSON or file content
  ↓
Service unwraps/normalizes response where needed
  ↓
Component stores data in local state
  ↓
Loading/error state is cleared and UI renders table/cards/form values
```

Examples:

- `LeaveBalance` gets the current or supplied user ID, calls `getLeaveBalance(userId)`, stores `response.data`, and renders leave cards/details. The service normalizes alternate backend field names such as `bdlAvailable`/`bdL_Total` into the frontend `LeaveBalanceApiData` shape.
- `UserProvider` calls `getLoginUserInfoByUserid(loginUserAdID)` after authentication and derives frontend `isManager`/`isAdmin` flags that drive navbar visibility.
- `DocumentViewer` loads document types, loads documents for the route-selected type, fetches selected document blobs for preview, and refreshes the list after add/update operations.
- `PendingApproval` loads pending leave requests and team members in parallel for the manager and maps the data into local approval rows.

### Sending Data

Typical mutation flow:

```text
User submits form or clicks action button
  ↓
Component validates required fields and constructs JSON/FormData payload
  ↓
Component sets submitting/action loading state
  ↓
Service function POSTs JSON or multipart form data to /api
  ↓
apiClient attaches bearer token for API calls and invalidates cached GETs after non-GET
  ↓
Component handles success by showing a message, resetting form state, navigating, or reloading data
  ↓
Component handles failure by storing an error string and keeping user-facing context visible
```

Examples:

- `LeaveForm` validates leave type, date range, reason, contact information, and half-day/day-count requirements before calling `saveLeaveRequest()`. When an attachment exists and a leave ID is returned, it calls `saveLeaveRequestAttachment()` with multipart `FormData`.
- `PendingApproval` gathers selected pending rows and remarks, validates reject remarks, then calls `bulkApproveReject()` and reloads approval data on success.
- `Myprofile` validates emergency contact numbers before sending `updateEmergencyContactDetails()` and displays success or field-level errors.
- `Insurance` validates nominee details, relationship rules, child age constraints, percentage share totals, and date fields before calling `manageInsuranceNominationDetails()`.
- `DocumentViewer` sends document add/update forms as `FormData`, invalidates cached GET data, and reloads the document list for the selected type.

## API Data Models

The key frontend API models live in `src/types/apiTypes.ts`. Important examples include:

- `LoginUserInfo`: employee number, eligibility code, and frontend role flags such as manager/team head/center head/admin/display-report.
- `LeaveBalanceResponse` and `LeaveBalanceApiData`: status/message wrapper plus normalized leave bucket totals, submitted values, balances, and maternity/paternity applicability flags.
- `LeaveTypeApi`, `LeaveStatusApi`, `HolidayResponse`, `ReasonApi`, and `NoOfDaysApi`: lookup/read models used in leave forms and filters.
- `LeaveDetailsApi` and `LeaveDetails`: leave history and single-leave detail data consumed by detail tables/views.
- `TeamMemberApi`, `ManageProfileEmpProfileApi`, `EmployeeContactApi`, and profile/contact request types: employee/profile screens and emergency contact update payloads.
- Report row models such as `ManagerLeaveDetailsExcelApi`, `ManagerLeaveBalanceExcelApi`, and summary report interfaces: data adapted for PDF/CSV/table export.
- Special leave, document, insurance, exit adjustment, and leave exception models: request/response shapes used by the corresponding pages.

Where the backend may return either an array or a `{ data: [...] }` wrapper, service functions normalize the response before returning it to components.

## Pages and Components

| Frontend area | Important files | Reads data | Sends data/actions |
| --- | --- | --- | --- |
| Application shell | `src/main.tsx`, `src/App.tsx`, `src/layouts/MainLayout.tsx`, `src/components/Navbar 1.tsx` | auth account, login-user info, HR resources | navigation, sign-in redirects handled by MSAL |
| Leave application | `src/pages/ApplyLeave.tsx`, `src/pages/ApplyLeaveForOthers.tsx`, `src/components/LeaveForm.tsx` | leave types, approver, working-day count, optional employee profile | leave request JSON, optional attachment form data |
| Leave history/detail | `src/pages/LeaveDetails.tsx`, `src/components/MyLeaveDetail.tsx`, `src/components/ViewLeave.tsx`, `src/pages/ViewEmployeeLeave.tsx` | leave history filters/details, attachments | cancel/action status updates where enabled |
| Leave balance/rules/holidays | `src/components/LeaveBalance.tsx`, `src/pages/LeaveRules.tsx`, `src/components/HolidayList.tsx` | balances, rules, holiday list | no main mutations |
| Profile/contact | `src/components/Myprofile.tsx`, `src/components/EmployeeProfile.tsx` | profile, contact, employee/team metadata | profile create/update and emergency contact updates |
| Manager approvals | `src/admin/PendingApproval.tsx`, `src/pages/TeamLeaveDetails.tsx` | pending approvals, team members, team leave requests | bulk approve/reject or row actions |
| HR search/actions | `src/components/SingleSearch.tsx`, `src/pages/SingleSearchDetails.tsx`, `src/pages/SingleSearchCreateException.tsx`, `src/pages/ExitLeaveAdjustment.tsx` | employee search/profile/contact/leave/adjustment/exception data | leave exception and exit adjustment updates |
| Special leave | `src/pages/SpecialLeaveEntry.tsx` | special leave types, assigned special leaves, employees by team | bulk add or deactivate special leaves |
| Documents | `src/pages/ViewDocuments.tsx`, `src/components/DocumentViewer.tsx` | document types, document lists, document files/search results | add/update document metadata and files |
| Insurance | `src/components/Insurance.tsx` | profile, relations, child max age, existing nominations | nominee management payload |
| Reports/exports | `src/components/QuickExport.tsx`, `src/components/DownLoadCenter.tsx`, `src/components/SummaryReport.tsx`, `src/utils/*ExportUtil.ts` | manager/all-employee report endpoints | frontend-generated CSV/PDF downloads |

## Forms, Validation, Loading, and Error Handling

- Forms are implemented with React controlled state in the feature component rather than a separate form library.
- Validation is component-specific. Examples include required leave fields/date ranges, emergency contact phone number rules, reject-remarks validation, insurance nominee rules/percentage totals, special leave date/employee selections, and document add/update required fields.
- Loading states are local booleans such as `loading`, `isSubmitting`, `actionLoading`, `pdfLoading`, or page-loader flags; skeleton components (`PageSkeleton`, `LeaveBalanceSkeleton`, `DocumentPreviewSkeleton`) are used in key screens.
- Errors are generally caught in components and stored as user-facing strings. Some services throw errors when backend `isSuccess` is false or expected data is missing.
- Empty states are handled by rendering empty tables/messages after successful loads with no returned rows.
- There is no repository-wide React error boundary identified in the frontend code.

## Configuration

Frontend configuration is read through Vite environment variables:

```text
VITE_API_BASE_URL = Optional API origin/base URL. Blank keeps /api requests relative to the SPA origin.
VITE_AAD_CLIENT_ID = Microsoft Entra ID SPA application/client ID.
VITE_AAD_TENANT_ID = Microsoft Entra tenant ID used to build the authority URL.
VITE_AAD_REDIRECT_URI = Redirect URI registered for the SPA.
VITE_AAD_POST_LOGOUT_REDIRECT_URI = URI used after logout redirects.
VITE_AAD_API_SCOPE = API scope requested by MSAL for backend bearer tokens.
```

Development behavior:

- `.env.development` leaves `VITE_API_BASE_URL` blank.
- `vite.config.ts` proxies `/api/*` to `http://10.81.70.203:81` during `npm run dev`.

Production/UAT behavior shown in repository configuration:

- `.env.production` defines a production API base URL and Entra redirect values.
- `public/web.config` is intended for IIS/static hosting and same-origin `/api/*` reverse proxying.

Do not add secrets to frontend env files. Browser-delivered Vite variables are public to users of the built SPA.

## Prerequisites

- Node.js and npm compatible with the checked-in `package-lock.json` and Vite 7 toolchain.
- Access to the HRMS backend `/api/*` endpoints, either through the Vite dev proxy or an explicit `VITE_API_BASE_URL`.
- Microsoft Entra ID application registration values for the SPA and API scope.

## Installation

```bash
npm install
```

## Running the Frontend Locally

1. Review `.env.development` and set the Vite variables for your environment without adding secrets.
2. Start the Vite dev server:

```bash
npm run dev
```

3. Open the local URL printed by Vite, normally `http://localhost:5173/`.
4. Ensure that the redirect URI is registered in Entra ID and that `/api/*` calls can reach the backend through the dev proxy or `VITE_API_BASE_URL`.

## Available Frontend Scripts

Scripts currently defined in `package.json`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server. |
| `npm run build` | Run TypeScript project build and create a production Vite build. |
| `npm run deploy` | Windows/IIS-oriented `robocopy` of `dist` to a configured network share. |
| `npm run build:deploy` | Build, then run deploy. |
| `npm run lint` | Run ESLint against the repository. |
| `npm run preview` | Preview the production build locally with Vite. |

No `npm test` script is currently defined.

## Build

```bash
npm run build
```

The build runs `tsc -b` first, then `vite build`.

## Testing and Validation

There is no automated frontend test script in `package.json`. Use these available checks:

```bash
npm run lint
npm run build
```

## Troubleshooting

- **Sign-in loops or missing configuration:** verify all `VITE_AAD_*` variables are present and that the redirect URI matches the Entra app registration.
- **API returns HTML instead of JSON:** `apiClient.ts` treats this as a reverse-proxy misconfiguration. Check the Vite proxy in development or IIS/ARR reverse proxy in hosted environments.
- **Unexpected 401/403 responses:** confirm the frontend can acquire `VITE_AAD_API_SCOPE` and that `/api/*` calls include an Entra bearer token.
- **Document/file preview problems:** document file endpoints must return PDF, octet-stream, spreadsheet, or image content; otherwise the frontend rejects the response as an unexpected content type.
- **Stale data after mutations:** non-GET API calls invalidate the shared GET cache; if a direct `fetch()` mutation is added, call `invalidateApiGetCache()` before reloading data.

## Backend Scope Limitation

The backend is documented here only as the API surface consumed by the frontend. This README does not describe backend architecture, database schema, backend business logic, controller/service internals, or deployment topology except where needed for frontend API connectivity.

## Information Not Determined From the Frontend Code

- No dedicated automated test framework or `npm test` script is present.
- Fine-grained backend authorization rules cannot be determined from the frontend alone; the frontend only hides some navigation based on role flags returned by the login-user API.
- Exact backend database schemas and server-side processing behavior are intentionally out of scope.
