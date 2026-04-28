import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="container py-24 flex min-h-[50vh] items-center justify-center">
        <div className="text-center max-w-md">
          <p className="label-editorial mb-3">Punjabi Fashion</p>
          <h1 className="heading-editorial text-4xl mb-4">Page not found</h1>
          <p className="text-muted-foreground font-body mb-8">
            This page does not exist or may have moved. Shop collections and new arrivals from the home page.
          </p>
          <Link to="/" className="btn-luxury btn-luxury-gold inline-block">
            Back to home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
