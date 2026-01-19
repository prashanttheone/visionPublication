"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout, Menu, Button, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { label: "About", href: "/about" },
  // { label: "Books", href: "/books" },
  { label: "E-Resources", href: "/resources" },
  { label: "Join As Author", href: "/join-as-author" },
  { label: "Event / Vision CSR", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const CATALOG_PDF_LINK =
  "https://drive.google.com/file/d/13fzHOMvpP4K6YP3z99HOekh6vjQphCbZ/view";

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ marginRight: 24, display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              height: 60,
              width: 140,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/newlogo.png"
              alt="Vision Publications"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        {!isMobile && (
          <>
            <Menu
              mode="horizontal"
              style={{
                flex: 1,
                background: "transparent",
                borderBottom: "none",
                fontSize: 16,
                fontWeight: 600,
              }}
              items={navItems.map((item) => ({
                key: item.href,
                label: <Link href={item.href}>{item.label}</Link>,
              }))}
            />

            <Link href="/books">
              <Button
                type="primary"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  border: "none",
                  fontWeight: 700,
                  marginRight: 16,
                }}
              >
                Books
              </Button>
            </Link>
            <Button
              type="primary"
              onClick={() => window.open(CATALOG_PDF_LINK, "_blank")}
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                border: "none",
                fontWeight: 700,
              }}
            >
              Get Catalogue
            </Button>
          </>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            style={{ color: "#fff", marginLeft: "auto" }}
          />
        )}
      </Header>

      {/* Mobile Drawer */}

      <Drawer
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        size={300}
        closable={false}
        styles={{
          body: {
            padding: 0,
            background: "linear-gradient(180deg, #0f172a, #1e293b)",
          }
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            height: 72,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <img
            src="/newlogo.png"
            alt="Vision Publications"
            style={{ height: 36 }}
          />
          <Button
            type="text"
            onClick={() => setOpen(false)}
            style={{ color: "#fff" }}
          >
            ✕
          </Button>
        </div>

        {/* Menu */}
        <Menu
          mode="vertical"
          style={{
            background: "transparent",
            border: "none",
            paddingTop: 12,
          }}
          items={navItems.map((item) => ({
            key: item.href,
            label: (
              <Link href={item.href}>
                <span
                  style={{
                    color: "#e5e7eb",
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ),
          }))}
          onClick={() => setOpen(false)}
        />

        {/* CTA */}
        <div
          style={{
            padding: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: "auto",
          }}
        >
          <Link href="/books">
            <Button
              type="primary"
              size="large"
              block
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                border: "none",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Books
            </Button>
          </Link>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => {
              window.open(CATALOG_PDF_LINK, "_blank");
              setOpen(false);
            }}
            style={{
              background: "linear-gradient(135deg,#f59e0b,#f97316)",
              border: "none",
              fontWeight: 700,
            }}
          >
            Get Catalogue
          </Button>
        </div>
      </Drawer>
    </>
  );
}
