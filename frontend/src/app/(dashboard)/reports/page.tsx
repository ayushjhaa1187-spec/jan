import GradeDistributionChart from '@/components/charts/GradeDistributionChart'
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart'
import PassFailChart from '@/components/charts/PassFailChart'
import TopPerformersChart from '@/components/charts/TopPerformersChart'
export default function ReportsPage() { return <div className='grid md:grid-cols-2 gap-4'><GradeDistributionChart /><SubjectAveragesChart /><PassFailChart /><TopPerformersChart /></div> }
