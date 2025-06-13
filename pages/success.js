import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Success() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (course_id) {
      // Save purchased course
      const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      if (!purchasedCourses.includes(parseInt(course_id))) {
        purchasedCourses.push(parseInt(course_id));
        localStorage.setItem('purchasedCourses', JSON.stringify(purchasedCourses));
      }
      setIsLoading(false);
      setTimeout(() => {
        router.push(`/courses/${course_id}`);
      }, 3000); // Redirect to course page after 3 seconds
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
                  Thank you for your purchase. You will be redirected to your course in 3 seconds.
                </p>
                <p className="text-center">
                  <a href={`/courses/${course_id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">
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
