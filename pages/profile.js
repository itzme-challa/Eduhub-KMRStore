import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, get, ref, child } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '' });
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fetchPurchases = async () => {
          const dbRef = ref(getDatabase());
          const snapshot = await get(child(dbRef, `purchases/${currentUser.uid}`));
          if (snapshot.exists()) {
            const purchasedIds = Object.keys(snapshot.val()).map(Number);
            setPurchasedCourses(purchasedIds);
          }

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
        };
        fetchPurchases();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast.success('Logged in successfully!');
      setLoginData({ email: '', password: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      toast.success('Account created successfully! Please log in.');
      setSignupData({ email: '', password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
      setUser(null);
      setPurchasedCourses([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const myCourses = courses.filter(course => purchasedCourses.includes(course.id));
  const newCourses = courses.filter(course => !purchasedCourses.includes(course.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="contact-card">
            <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : user ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Courses</h2>
                  {myCourses.length === 0 ? (
                    <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {myCourses.map(course => (
                        <div key={course.id} className="course-card bg-white rounded-xl shadow-lg p-6">
                          <div className="image-container relative w-full h-48">
                            <Image
                              src={course.image || '/default-course.jpg'}
                              alt={course.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{course.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                          <Link href={`/my-courses/${user.uid}/${course.id}`}>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              View Course
                            </button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">New Courses</h2>
                  {newCourses.length === 0 ? (
                    <p className="text-gray-600">No new courses available.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {newCourses.map(course => (
                        <div key={course.id} className="course-card bg-white rounded-xl shadow-lg p-6">
                          <div className="image-container relative w-full h-48">
                            <Image
                              src={course.image || '/default-course.jpg'}
                              alt={course.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{course.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                          <Link href={`/courses/${course.id}`}>
                            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                              Buy Now
                            </button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="contact-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Login</h2>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        className="input-field"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="loginPassword"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        className="input-field"
                        placeholder="Your password"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="contact-button">
                        Login
                      </button>
                    </div>
                  </form>
                </div>
                <div className="contact-card p-6">
                  <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                      <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="signupEmail"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupInputChange}
                        className="input-field"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="signupPassword"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupInputChange}
                        className="input-field"
                        placeholder="Your password"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupInputChange}
                        className="input-field"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="contact-button">
                        Sign Up
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
