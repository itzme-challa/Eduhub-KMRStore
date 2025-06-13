import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, getDatabase, set, ref } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Success() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (course_id && auth.currentUser) {
      const savePurchase = async () => {
        await set(ref(getDatabase(), `purchases/${auth.currentUser.uid}/${course_id}`), {
          purchasedAt: new Date().toISOString(),
        });
        setIsLoading(false);
        setTimeout(() => {
          router.push(`/my-courses/${auth.currentUser.uid}/${course_id}`);
        }, 3000);
      };
      savePurchase();
    } else {
      setIsLoading(false);
    }
  }, [course_id, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="success-card">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-center mb-4">Purchase Successful!</h1>
                <p className="text-center text-gray-600 mb-6">
                  Congratulations! You can now access your course. Redirecting to your course in 3 seconds...
                </p>
                <p className="text-center">
                  <a href={`/my-courses/${auth.currentUser?.uid}/${course_id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                    Go to course now
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
