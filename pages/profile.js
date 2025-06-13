import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, getDatabase, ref, onValue } from '../firebase';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        toast.error('Please log in to view your profile.');
        router.push('/login');
      } else {
        setUser(currentUser);
        const db = getDatabase();
        const purchasesRef = ref(db, `purchases/${currentUser.uid}`);
        onValue(purchasesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const purchaseList = Object.values(data);
            setPurchases(purchaseList);
          }
        });
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Profile
          </h1>
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Details
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Name:</strong> {user.displayName || 'N/A'}
            </p>
            <p className="text-gray-600 mb-6">
              <strong>Email:</strong> {user.email}
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Purchased Courses
            </h2>
            {purchases.length > 0 ? (
              <ul className="space-y-4">
                {purchases.map((purchase, index) => (
                  <li key={index} className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-800">
                      <strong>Course:</strong> {purchase.courseName}
                    </p>
                    <p className="text-gray-600">
                      <strong>Amount:</strong> ₹{purchase.amount}
                    </p>
                    <p className="text-gray-600">
                      <strong>Order ID:</strong> {purchase.orderId}
                    </p>
                    <p className="text-gray-600">
                      <strong>Date:</strong>{' '}
                      {new Date(purchase.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No purchases found.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
