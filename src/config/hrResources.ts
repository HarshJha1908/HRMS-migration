import {
  faArrowUpRightFromSquare,
  faAward,
  faChalkboardUser,
  faClipboardList,
  faDoorOpen,
  faHandHoldingMedical,
  faHospital,
  faLandmark,
  type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export type HrResourceLink = {
  text: string;
  url: string;
  navText?: string;
  navUrl?: string;
  title?: string;
  allowedEmployeeTypes?: string[];
};

export type HrResourceGroup = {
  title: string;
  navTitle?: string;
  navIcon: string;
  navIconClassName: string;
  homeIcon: IconDefinition;
  links: HrResourceLink[];
  allowedEmployeeTypes?: string[];
};

const lgssPoliciesUrl =
  "https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx?RootFolder=%2fsites%2fLinde+IS+Kolkata+Center%2fHR+Documents%2fLISKC+Local+Policies&FolderCTID=0x012000920ADECB82359C489EFB07D283255E88&View=%7bFE8B44BC-9711-424F-A0B9-FD411227CA94%7d&xsdata=MDV8MDJ8c2F5YW50aW5pLnNlbi5jaG91ZGh1cnlAbGluZGUuY29tfDhiYzdjYzg1ZWNhMzQzYTVmZDMwMDhkZDAwM2U3YmFifDE1NjJmMDA3MDlhNDRmY2I5MzZiZTc5MjQ2NTcxZmM3fDB8MHw2Mzg2NjY5OTA1MzgxMDYwNTJ8VW5rbm93bnxUV0ZwYkdac2IzZDhleUpGYlhCMGVVMWhjR2tpT25SeWRXVXNJbFlpT2lJd0xqQXVNREF3TUNJc0lsQWlPaUpYYVc0ek1pSXNJa0ZPSWpvaVRXRnBiQ0lzSWxkVUlqb3lmUT09fDB8fHw%3d&sdata=WEVjTTRvSkxOZTZUU3hENU1sL29ISHBQc2d6a1Arbmo0SkttZFpvMXVQcz0%3dEnter+text+here...&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx";

const ACT = "ACT";
export const hrResourceGroups: HrResourceGroup[] = [
  {
    title: "Kolkata Center Leave Tool",
    navIcon: "",
    navIconClassName: "",
    homeIcon: faDoorOpen,
    allowedEmployeeTypes: [ACT],
    links: [
      {
        text: "Home",
        url: "/leave-tool-home"
      }
    ]
  },
  {
    title: "Kolkata Center HR Policies",
    navTitle: "Policies",
    navIcon: "\uD83D\uDCC4",
    navIconClassName: "hr-mega-icon--blue",
    homeIcon: faClipboardList,
    allowedEmployeeTypes: [ACT],
    links: [
      {
        text: "LGSS Policies",
        url: lgssPoliciesUrl
      }
    ]
  },
  {
    title: "Payroll Portal",
    navTitle: "Payroll Portal",
    navIcon: "\uD83E\uDDFE",
    navIconClassName: "hr-mega-icon--green",
    homeIcon: faLandmark,
    links: [
      {
        text: "Home",
        navText: "Payroll",
        url: "https://www.cquel.com/lgss/payroll/home.php"
      }
    ]
  },
  {
    title: "Hospitalization",
    navIcon: "\uD83C\uDFE5",
    navIconClassName: "hr-mega-icon--red",
    homeIcon: faHospital,
    links: [
      {
        text: "Reimbursement Claim Form",
        url: "https://prod.hrms.linde.grp/DocHRMS/Hospitalization/Claim%20Form.pdf"
      },
      {
        text: "Network Hospital List",
        url: "https://portal.mediassist.in/Home.aspx"
      },
      {
        text: "All Hospitalization Related Information",
        url: "https://prod.hrms.linde.grp/DocHRMS/Hospitalization/All%20relevant%20information%20regarding%20Hospitalization"
      },
      {
        text: "GPA/GTL/GHI Declaration",
        url: "/insurance"
      }
    ]
  },
  {
    title: "Reward & Recognition Portal",
    navTitle: "Reward & Recognization",
    navIcon: "\uD83C\uDFC6",
    navIconClassName: "hr-mega-icon--purple",
    homeIcon: faAward,
    allowedEmployeeTypes: [ACT],
    links: [
      {
        text: "Home",
        url: "https://apps.powerapps.com/play/e/default-1562f007-09a4-4fcb-936b-e79246571fc7/a/66ac46e3-2b3e-4091-8499-712b0ba26628"
      }
    ]
  },
  {
    title: "Training & Certification Portal",
    navTitle: "Training & Certification",
    navIcon: "\uD83C\uDF93",
    navIconClassName: "hr-mega-icon--purple",
    homeIcon: faChalkboardUser,
    allowedEmployeeTypes: [ACT],
    links: [
      {
        text: "Home",
        url: "https://apps.powerapps.com/play/e/613585e3-8656-4fe7-960f-0ca2d2332bd2/a/dcec88b5-27a8-480c-9efe-f28a9d431354?tenantId=1562f007-09a4-4fcb-936b-e79246571fc7"
      }
    ]
  },
  {
    title: "Other Important Links",
    navTitle: "Quick Links",
    navIcon: "\uD83D\uDD17",
    navIconClassName: "hr-mega-icon--orange",
    homeIcon: faArrowUpRightFromSquare,
    allowedEmployeeTypes: [ACT],
    links: [
      {
        text: "Linde Intranet",
        url: "https://lindegroup.sharepoint.com/sites/Airtime",
        navUrl: "https://lindegroup.sharepoint.com/sites/Airtime?xsdata=MDV8MDJ8c3VtYW4uYmlzd2FzQGxpbmRlLmNvbXw2YTA5NDQ0YTJhZWQ0MTZiZWRlYTA4ZGQ4MGJkZDQyNnwxNTYyZjAwNzA5YTQ0ZmNiOTM2YmU3OTI0NjU3MWZjN3wwfDB8NjM4ODA4Mjc0OTk4MDgwNTUzfFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=SjJmS1NnVzlkdWN3MTlBbTlhWEtLUk5HRnNJRC9GMHQ0TXkyZk9Wd1Ridz0%3d&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fAirtime"
      },
      {
        text: "SMAX",
        url: "https://smax.linde.com/homepage"
      },
      {
        text: "My Linde Portal",
        url: "https://pgw.linde.grp/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html",
        navUrl: "https://pgw.linde.grp/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-ui2-cache-disable=X&sap-client=100&sap-language=EN&sap-theme=zlgc_custom_quartz@https://pgw.linde.grp:/sap/public/bc/themes/~client-100/#Shell-home",
        allowedEmployeeTypes: ["NON_ACT"]
      },
      {
        text: "Onboarding Or Induction Materials",
        url: "https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx",
        navText: "Onboarding Or Induction materials",
        navUrl: "https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx?RootFolder=%2Fsites%2FLinde%20IS%20Kolkata%20Center%2FHR%20Documents%2FInduction%202022&FolderCTID=0x012000920ADECB82359C489EFB07D283255E88&View=%7BFE8B44BC%2D9711%2D424F%2DA0B9%2DFD411227CA94%7D&InitialTabId=Ribbon%2ERead&VisibilityContext=WSSTabPersistence&OR=Teams-HL&CT=1696326934347&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiIyNy8yMzA5MDExMjIyOSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D",
        allowedEmployeeTypes: [ACT]
      }
    ]
  },
  {
    title: "TEMS",
    navIcon: "\uD83D\uDCD1",
    navIconClassName: "hr-mega-icon--orange",
    homeIcon: faHandHoldingMedical,
    links: [
      {
        text: "Claims Portal",
        url: "https://etms.rse.linde.grp/PC/home.aspx"
      }
    ]
  }
];

const isActAllowed = (
  employeeTypeCode: string | undefined,
  allowedEmployeeTypes?: string[]
) => {
  return Boolean(allowedEmployeeTypes?.includes(
    String(employeeTypeCode || "").trim().toUpperCase()
  ));
};

export const getVisibleHrResourceGroups = (
  employeeTypeCode: string | undefined
) => {
  const normalizedEmployeeType = String(employeeTypeCode || "").trim().toUpperCase();

  if (normalizedEmployeeType !== ACT) {
    return hrResourceGroups;
  }

  return hrResourceGroups
    .filter((group) =>
      isActAllowed(normalizedEmployeeType, group.allowedEmployeeTypes)
    )
    .map((group) => ({
      ...group,
      links: group.links.filter((link) =>
        !link.allowedEmployeeTypes ||
        isActAllowed(normalizedEmployeeType, link.allowedEmployeeTypes)
      )
    }))
    .filter((group) => group.links.length > 0);
};
