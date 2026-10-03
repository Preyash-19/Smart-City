import Navbar from '../../components/Navbar';
import ComplaintForm from '../../components/ComplaintForm';

export default function ReportPage() {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <Navbar />
      <ComplaintForm />
    </div>
  );
}
