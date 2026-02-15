import { useState } from "react";
import { Row, Col, Typography, Card, Tag, Space, Button, Divider } from "antd";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import news from "../../_mock/films.json"
import type {NewsItem} from "../../types/ui"


const { Text, Title, Paragraph } = Typography;

const NEWS_ITEMS: NewsItem[] = [
  {
    "id": 1,
    "title": "New IMAX Theater Opening Soon",
    "date": "February 12, 2026",
    "category": "Announcement",
    "content": "We're excited to announce that our brand new IMAX theater will be opening next month, featuring state-of-the-art laser projection and immersive sound systems.",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
    "fullContent": "We're thrilled to announce the grand opening of our brand new IMAX theater, scheduled for March 15, 2026! This state-of-the-art cinema experience will feature the latest IMAX laser projection technology, delivering unprecedented image quality with enhanced brightness, deeper contrast, and the widest color gamut available.\n\nThe theater will be equipped with a 12-channel sound system that creates an immersive audio experience, making you feel like you're part of the action. With 300 premium seats featuring ergonomic design and optimal viewing angles, every seat in the house will be the best seat.\n\nOpening week special: Get 30% off all IMAX screenings! We'll be featuring major blockbusters including the latest sci-fi epic and nature documentaries that showcase the full capabilities of IMAX technology.\n\nPre-booking opens February 20th. Don't miss this opportunity to experience cinema like never before!"
  },
  {
    "id": 2,
    "title": "Student Discount Available",
    "date": "February 10, 2026",
    "category": "Promotions",
    "content": "All UTM students can now enjoy 20% off on all movie tickets. Just show your student ID at the box office!",
    "image": "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800&h=500&fit=crop",
    "fullContent": "We're excited to introduce our new Student Discount Program, exclusively for UTM students! Starting immediately, all valid UTM student ID holders can enjoy 20% off on all movie tickets, any day of the week.\n\nHow to claim your discount:\n• Present your valid UTM student ID at the box office when purchasing tickets\n• Discount applies to all movie formats including standard, 3D, and IMAX screenings\n• Can be combined with matinee pricing for even greater savings\n• Valid for both online bookings (use your student email) and in-person purchases\n\nAdditionally, students can enjoy:\n• 15% off all concessions items\n• Priority booking for special student-only screening events\n• Free membership to our loyalty program\n\nThis initiative is part of our commitment to making quality entertainment accessible to the student community. We believe that movies are not just entertainment, but also an important part of cultural education and social bonding.\n\nTerms and conditions apply. Valid student ID must be presented upon ticket collection."
  },
  {
    "id": 3,
    "title": "Oscar Winners Marathon",
    "date": "February 8, 2026",
    "category": "Event",
    "content": "Join us for a special weekend marathon featuring all the latest Oscar-winning films. Special pricing available for the full weekend pass.",
    "image": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
    "fullContent": "Mark your calendars for the ultimate cinematic celebration! This February 22-23, we're hosting an exclusive Oscar Winners Marathon featuring all the major Oscar-winning films from this year's ceremony.\n\nSchedule:\nSaturday, February 22:\n• 10:00 AM - Best Picture Winner\n• 1:30 PM - Best Director Winner\n• 4:00 PM - Best International Film\n• 7:00 PM - Best Animated Feature\n• 9:30 PM - Best Documentary\n\nSunday, February 23:\n• 11:00 AM - Best Original Screenplay\n• 2:00 PM - Best Adapted Screenplay\n• 5:00 PM - Special retrospective screening\n\nTicket Options:\n• Single screening: $12\n• Day pass (all screenings in one day): $40\n• Full weekend pass: $65 (Save $31!)\n• VIP weekend pass: $95 (includes reserved seating, complimentary popcorn and drink, and exclusive poster)\n\nEach screening will be introduced by local film critics and will include brief Q&A discussions. This is a perfect opportunity for film enthusiasts to experience the best of cinema in a celebration of the art form.\n\nSeats are limited! Book your passes now online or at the box office. Members get an additional 10% discount."
  },
  {
    "id": 4,
    "title": "New Snack Bar Menu",
    "date": "February 5, 2026",
    "category": "News",
    "content": "Check out our expanded snack bar menu with new gourmet popcorn flavors, healthy options, and premium beverages.",
    "image": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&h=500&fit=crop",
    "fullContent": "We've completely revamped our snack bar menu to offer you an elevated cinema dining experience! After listening to customer feedback, we're excited to introduce a diverse range of options that cater to all tastes and dietary preferences.\n\nGourmet Popcorn Flavors:\n• Classic Butter (always a favorite)\n• Caramel & Sea Salt\n• White Cheddar\n• Spicy Jalapeño\n• Sweet & Salty Kettle Corn\n• Truffle Parmesan (Premium)\n\nHealthy Options:\n• Fresh fruit cups\n• Veggie sticks with hummus\n• Protein boxes with cheese, nuts, and crackers\n• Granola bars and trail mix\n• Sugar-free candy options\n\nPremium Beverages:\n• Specialty coffee drinks (cappuccino, latte, mocha)\n• Fresh-squeezed lemonade\n• Organic iced teas\n• Craft sodas in unique flavors\n• Smoothies (strawberry, mango, mixed berry)\n\nWe've also expanded our hot food menu with:\n• Gourmet hot dogs with various toppings\n• Nachos with premium toppings\n• Personal pizzas\n• Chicken tenders and mozzarella sticks\n\nAll items are made with quality ingredients, and we're committed to offering vegetarian, vegan, and gluten-free options. Our staff is trained to help you find the perfect snack for your movie experience.\n\nCome early before your movie to try our new offerings! Combo deals available for great savings."
  }
]


const CATEGORY_COLORS: Record<NewsItem["category"], { text: string; border: string }> =
  {
    Promotions: { text: "#e31e24", border: "#ffccc7" },
    Films: { text: "#2f54eb", border: "#adc6ff" },
    News: { text: "#389e0d", border: "#b7eb8f" },
    Events: {  text: "#d46b08", border: "#ffd591" },
  };

const NewsCard: React.FC<{ item: NewsItem; featured?: boolean }> = ({
  item,
  featured = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORY_COLORS[item.category];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: featured ? "58%" : "62%",
          overflow: "hidden",
          borderRadius: 6,
          background: "#f0f0f0",
          flexShrink: 0,
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.45s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 3,
              backdropFilter: "blur(4px)",
            }}
          >
            {item.category}
          </span>
        </div>
      </div>

      <div style={{ paddingTop: 14, flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 8,
          }}
        >
          <CalendarOutlined style={{ fontSize: 11, color: "#aaa" }} />
          <Text style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.04em" }}>
            {item.date}
          </Text>
        </div>

        <Text
          strong
          style={{
            fontSize: featured ? 15 : 13,
            color: hovered ? "#e31e24" : "#1a1a1a",
            lineHeight: 1.4,
            display: "block",
            marginBottom: 8,
            transition: "color 0.2s ease",
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "#888",
            lineHeight: 1.65,
            flex: 1,
          }}
        >
        </Text>

        <div style={{ marginTop: 14 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#e31e24",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "gap 0.2s",
            }}
          >
            Read more
            <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Text>
        </div>
      </div>
    </div>
  );
};

const CinemaNews = ({title='', items=[]}:any) => {
  //const [featured, ...rest] = NEWS_ITEMS;

  return (
    <div
      style={{
        background: "#fff",
        padding: "48px 0 56px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 4,
                height: 18,
                background: "#e31e24",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#333",
              }}
            >
              News &amp; Promotions
            </Text>
          </div>

          <Button
            type="link"
            style={{
              color: "#e31e24",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: 0,
              height: "auto",
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            All news
          </Button>
        </div>

            <Row gutter={[20, 0]} style={{ height: "100%" }}>
              {items.map((item:any, idx:number) => (
                <Col key={item.id} xs={24} sm={8} md={8} style={{ height: "100%" }}>
                  <div
                    style={{
                      height: "100%",
                      borderLeft: idx > 0 ? "1px solid #f0f0f0" : "none",
                      paddingLeft: idx > 0 ? 20 : 0,
                    }}
                  >
                    <NewsCard item={item} />
                  </div>
                </Col>
              ))}
            </Row>
        <Divider style={{ marginTop: 40, borderColor: "#f0f0f0" }} />
      </div>
    </div>
  );
};

export default CinemaNews;