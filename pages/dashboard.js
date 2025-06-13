import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Dashboard() {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPurchases = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
    setPurchasedCourses(savedPurchases);

    fetch('/courses.json')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading courses:', error);
        setIsLoading(false);
      });
  }, []);

  const userCourses = courses.filter(course => purchasedCourses.includes(course.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Learning Dashboard</h1>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : userCourses.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
              <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {userCourses.map(course => (
                <div key={course.id} className="course-card bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h2>
                  <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  <div className="progress mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Progress: {JSON.parse(localStorage.getItem(`courseProgress_${course.id}`) || '{}').progress || 0}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${JSON.parse(localStorage.getItem(`courseProgress_${course.id}`) || '{}').progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Continue Learning
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
