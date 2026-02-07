import React from "react";
import Layout from "@/components/Layout";
import MenuSection from "@/components/MenuSection";

const Menu = () => {
  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-5xl font-extrabold text-center text-primary mb-12">Nosso Cardápio TremBão</h1>
        <MenuSection />
      </div>
    </Layout>
  );
};

export default Menu;