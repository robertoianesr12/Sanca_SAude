import React from "react";
import Layout from "@/components/Layout";
import OrderSection from "@/components/OrderSection";

const Order = () => {
  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-5xl font-extrabold text-center text-primary mb-12">Reserve sua Mesa ou Peça Online</h1>
        <OrderSection />
      </div>
    </Layout>
  );
};

export default Order;