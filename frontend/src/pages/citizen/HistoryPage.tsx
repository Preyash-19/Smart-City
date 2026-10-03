import Navbar from '../../components/Navbar';
import CitizenHistory from '../../components/CitizenHistory';

export default function HistoryPage() {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <Navbar />
      <CitizenHistory />
    </div>
  );
}
