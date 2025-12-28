import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+92 (321) 9664704",
      href: "tel:+92"
    },
    {
      icon: Mail,
      label: "Email",
      value: "akbusinessclud@gmail.com",
      href: "mailto:akbusinessclud@gmail.com"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "House no 76X, KSR Madina Town, Faisalabad , Pakistan",
      href: "#"
    }
  ];

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6 text-foreground">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-8 text-center hover-elevate">
                    <div className="flex justify-center mb-6">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3 text-foreground">
                      {info.label}
                    </h3>
                    <a 
                      href={info.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {info.value}
                    </a>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="p-8 md:p-12">
              <h2 className="font-display font-bold text-3xl mb-8 text-foreground">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12"
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Subject</label>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="h-12"
                    data-testid="input-contact-subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Message</label>
                  <Textarea
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="min-h-40 resize-none"
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 group"
                  disabled={isSubmitting}
                  data-testid="button-contact-submit"
                >
                  <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
