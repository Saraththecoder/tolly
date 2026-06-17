import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const MovieNews = lazy(() => import('../pages/MovieNews'));
const SingleArticle = lazy(() => import('../pages/MovieNews/SingleArticle'));
const Archive = lazy(() => import('../pages/MovieNews/Archive'));
const Reviews = lazy(() => import('../pages/Reviews'));
const SingleReview = lazy(() => import('../pages/Reviews/SingleReview'));
const BoxOffice = lazy(() => import('../pages/BoxOffice'));
const SingleBoxOffice = lazy(() => import('../pages/BoxOffice/SingleBoxOffice'));
const Search = lazy(() => import('../pages/Search'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Wrapper to provide suspense fallback
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSkeleton type="page" />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><Home /></SuspenseWrapper>,
      },
      {
        path: 'about',
        element: <SuspenseWrapper><About /></SuspenseWrapper>,
      },
      {
        path: 'movie-news',
        children: [
          {
            index: true,
            element: <SuspenseWrapper><MovieNews /></SuspenseWrapper>,
          },
          {
            path: 'archive',
            element: <SuspenseWrapper><Archive /></SuspenseWrapper>,
          },
          {
            path: ':slug',
            element: <SuspenseWrapper><SingleArticle /></SuspenseWrapper>,
          },
        ]
      },
      {
        path: 'reviews',
        children: [
          {
            index: true,
            element: <SuspenseWrapper><Reviews /></SuspenseWrapper>,
          },
          {
            path: ':slug',
            element: <SuspenseWrapper><SingleReview /></SuspenseWrapper>,
          },
        ]
      },
      {
        path: 'box-office',
        children: [
          {
            index: true,
            element: <SuspenseWrapper><BoxOffice /></SuspenseWrapper>,
          },
          {
            path: ':slug',
            element: <SuspenseWrapper><SingleBoxOffice /></SuspenseWrapper>,
          },
        ]
      },
      {
        path: 'search',
        element: <SuspenseWrapper><Search /></SuspenseWrapper>,
      },
      {
        path: '*',
        element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
      },
    ],
  },
]);

export default router;
