import ManagerView from '@/ux/CognitiveWalkthrough/views/ManagerView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import EditTest from '@/ux/CognitiveWalkthrough/views/EditTest.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import CWAnswerView from '@/ux/CognitiveWalkthrough/views/CWAnswerView.vue'

export default [
  {
    path: '/cognitive-walkthrough/manager/:id/:token?',
    name: 'CWManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/cognitive-walkthrough/report/:id/:token?',
        name: 'CWReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/cognitive-walkthrough/answer/:id/:token?',
        name: 'CWAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CWAnswerView,
      },
      {
        path: '/cognitive-walkthrough/edit/:id/:token?',
        name: 'CWEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/cognitive-walkthrough/settings/:id/:token?',
        name: 'CWSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/cognitive-walkthrough/cooperators/:id/:token?',
        name: 'CWCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
    ],
  },
]
