const BASE_SCHEDULE_URL = 'https://slbanformsp1-oc.uafs.edu:8888/banprod'

export const constants = {
  BASE_SCHEDULE_URL: BASE_SCHEDULE_URL,
  SCHEDULE_URL: `${BASE_SCHEDULE_URL}/hxskschd.FS_P_Schedule`,
  EMOJIS: {
    PREV: '1251027880935297126',
    NEXT: '1251027909347508247',
    STAR: '⭐'
  },
  DESCRIPTIONS: [
    { title: "Apps Dashboard", url: "https://myapplications.microsoft.com/" }, 
    { title: "Banner Self-Service", url: "https://slbanformsp1-oc.uafs.edu:8888/banprod/twbkwbis.P_WWWLogin?ret_code=SSFA" }, 
    { title: "UAFS Official Website", url: "https://uafs.edu/" }, 
    { title: "Blackboard Learn", url: "https://blackboard.uafs.edu/ultra" }, 
    { title: "Course Schedule", url: "https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule" }, 
    { title: "Lions CareerLink", url: "https://uafortsmith-csm.symplicity.com/students/?signin_tab=0" }, 
    { title: "Online Business Center (Cashnet)", url: "https://commerce.cashnet.com/UAFSpay" }, 
    { title: "Refunds", url: "https://www.refundselection.com/refundselection/#/welcome/continue" }, 
    { title: "MyUAFS", url: "https://my.uafs.edu" }, 
    { title: "Admissions Portal", url: "https://lions.uafs.edu/apply" }, 
    { title: "Dining", url: "https://dineoncampus.com/uafs" }, 
    { title: "Bookstore", url: "https://www.bkstr.com/uafsstore/home" } 
  ],
  STATUS_CHOICES: [
    { name: 'Any Status', value: '%' },
    { name: 'Canceled', value: 'X' },
    { name: 'Closed', value: 'C' },
    { name: 'Completed', value: 'P' },
    { name: 'In Progress', value: 'I' },
    { name: 'Open', value: 'O' },
    { name: 'Restricted', value: 'R' },
    { name: 'Waitlisted', value: 'W' }
  ],
  SECTION_CHOICES: [
    { name: 'Any Section', value: '%' },
    { name: 'Full-online', value: '%E' },
    { name: 'Hybrid', value: '%Y' },
    { name: 'Web-enhanced', value: '%D '},
    { name: '8 Week', value: '%G' },
    { name: 'Sequential', value: '%S' },
    { name: 'Weekend', value: '%W' },
    { name: 'Day', value: '0' },
    { name: 'Night', value: '9' },
    { name: 'Independent Study', value: '%A' },
    { name: 'Block', value: '%B' },
    { name: 'Honors', value: '%H' },
    { name: 'Intersession/Maymester/Special', value: '%Z' }
  ]
}