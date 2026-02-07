import React from "react";
import Layout from "@/components/Layout";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-5xl font-extrabold text-center text-primary mb-12">Fale Conosco</h1>
        <ContactSection />
      </div>
    </Layout>
  );
};

export default Contact;