import { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    // Load courses
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

    // Load purchased courses from localStorage or API
    const savedPurchases = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
    setPurchasedCourses(savedPurchases);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <div className="hero bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Learning Adventure</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Explore our curated collection of premium online courses to excel in your learning journey.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Courses</h2>
              <div className="course-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isPurchased={purchasedCourses.includes(course.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
