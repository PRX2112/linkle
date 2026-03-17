import { UserProfile } from "@/lib/types";

export const mockUser: UserProfile = {
    id: "user_123",
    username: "alexcreator",
    displayName: "Alex Creator",
    bio: "Digital Artist & Freelance Designer. Building brands that matter. 🎨✨",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
    theme: {
        primaryColor: "#6366f1", // Indigo 500
        backgroundColor: "var(--background)",
        fontFamily: "Inter",
        buttonStyle: "pill",
    },
    socialLinks: [
        { id: "1", platform: "instagram", url: "https://instagram.com", isVisible: true },
        { id: "2", platform: "twitter", url: "https://twitter.com", isVisible: true },
        { id: "3", platform: "linkedin", url: "https://linkedin.com", isVisible: true },
        { id: "4", platform: "email", url: "mailto:hello@alex.design", label: "Email Me", isVisible: true },
        { id: "5", platform: "youtube", url: "https://youtube.com", isVisible: true },
    ],
    businessLinks: [
        {
            id: "b1",
            title: "My Portfolio",
            url: "https://dribbble.com",
            description: "Check out my latest design case studies.",
            thumbnailUrl: "https://cdn.dribbble.com/users/4859/screenshots/14626966/media/4c557989938531bf6988894236ced487.png",
            isVisible: true,
        },
        {
            id: "b2",
            title: "Design Course",
            url: "https://gumroad.com",
            description: "Learn UI/UX design from scratch.",
            isVisible: true,
        },
    ],
    location: {
        address: "123 Creative Studio, Design District, NY",
        googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1709400000000!5m2!1sen!2sus",
        showDirectionsBtn: true,
        isVisible: true,
    },
    payments: [
        {
            id: "p1",
            platform: "paypal",
            value: "paypal.me/alexdesign",
            isVisible: true,
        },
        {
            id: "p2",
            platform: "upi",
            value: "alex@oksbi",
            isVisible: true,
        },
    ],
    contactActions: [
        {
            id: "c1",
            type: "book_appointment",
            label: "Book a Call",
            url: "https://calendly.com",
            isVisible: true,
        },
        {
            id: "c2",
            type: "download_resume",
            label: "Download Resume",
            url: "#",
            isVisible: true,
        },
    ],
};
