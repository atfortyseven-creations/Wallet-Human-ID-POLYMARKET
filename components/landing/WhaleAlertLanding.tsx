"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface ManifestoSection {
  id: string;
  title: string;
  body: string[];
}

interface WhaleAlertLandingProps {
  sections?: ManifestoSection[];
}

export default function WhaleAlertLanding({
  sections = [],
}: WhaleAlertLandingProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        color: "#1a1a1a",
        fontFamily:
          '"Georgia", "Times New Roman", serif',
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/*  Top navigation bar  */}
      <nav
        style={{
          borderBottom: "1px solid #d4d0c8",
          padding: "18px 0",
          backgroundColor: "#FDFCF8",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#555",
              fontWeight: 500,
            }}
          >
            Whale Alert Network
          </span>
          <button
            onClick={() => router.push("/")}
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              background: "none",
              border: "1px solid #1a1a1a",
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            Enter Terminal
          </button>
        </div>
      </nav>

      {/*  Document body  */}
      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "72px 24px 120px",
        }}
      >
        {/* Document title */}
        <header style={{ marginBottom: 64 }}>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 20,
            }}
          >
            Technical Documentation · Version 4.2.0
          </p>
          <h1
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "normal",
              lineHeight: 1.25,
              color: "#1a1a1a",
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            Whale Alert Network
          </h1>
          <p
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 18,
              lineHeight: 1.8,
              color: "#444",
              fontStyle: "italic",
              maxWidth: 620,
              marginBottom: 32,
            }}
          >
            A system-grade, real-time blockchain analytics system designed,
            engineered, and deployed entirely by one independent developer.
          </p>
          <div
            style={{
              height: 1,
              backgroundColor: "#d4d0c8",
              marginBottom: 40,
            }}
          />
          {/* Table of contents */}
          {sections.length > 0 && (
            <nav aria-label="Table of contents">
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: 14,
                }}
              >
                Contents
              </p>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  columns: 2,
                  columnGap: 32,
                }}
              >
                {sections.map((section, index) => (
                  <li
                    key={section.id}
                    style={{ marginBottom: 6, breakInside: "avoid" }}
                  >
                    <button
                      onClick={() => {
                        const el = document.getElementById(section.id);
                        if (el)
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 12,
                        color: "#555",
                        lineHeight: 1.6,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#bbb", minWidth: 24 }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span style={{ textTransform: "capitalize" }}>
                        {section.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </header>

        {/*  Sections  */}
        {sections.map((section, sectionIndex) => (
          <article
            key={section.id}
            id={section.id}
            style={{
              marginBottom: 80,
              paddingTop: sectionIndex > 0 ? 64 : 0,
              borderTop: sectionIndex > 0 ? "1px solid #e8e5de" : "none",
              scrollMarginTop: 72,
            }}
          >
            {/* Section heading */}
            <h2
              style={{
                fontFamily: '"Georgia", serif',
                fontSize: 24,
                fontWeight: "normal",
                color: "#1a1a1a",
                marginBottom: 32,
                lineHeight: 1.3,
                letterSpacing: "-0.005em",
              }}
            >
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 11,
                  color: "#bbb",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 400,
                }}
              >
                Section {String(sectionIndex + 1).padStart(2, "0")}
              </span>
              {section.title}
            </h2>

            {/* Body paragraphs */}
            <div>
              {section.body.map((para, i) => {
                /*  Subtitle  */
                if (para.startsWith("[SUBTITLE]")) {
                  return (
                    <h3
                      key={i}
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#999",
                        marginTop: 40,
                        marginBottom: 16,
                      }}
                    >
                      {para.replace("[SUBTITLE]", "")}
                    </h3>
                  );
                }

                /*  List item  */
                if (para.startsWith("[LIST_ITEM]")) {
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 10,
                        paddingLeft: 4,
                      }}
                    >
                      <span
                        style={{
                          color: "#bbb",
                          fontSize: 16,
                          lineHeight: "1.75",
                          flexShrink: 0,
                          fontFamily: "serif",
                        }}
                      >
                        ·
                      </span>
                      <p
                        style={{
                          fontFamily: '"Georgia", serif',
                          fontSize: 16,
                          lineHeight: 1.75,
                          color: "#444",
                          margin: 0,
                        }}
                      >
                        {para.replace("[LIST_ITEM]", "")}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    style={{
                      marginBottom: 40,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: 17,
                        lineHeight: 1.85,
                        color: "#2a2a2a",
                        margin: 0,
                        textAlign: "justify",
                        hyphens: "auto",
                      }}
                    >
                      {para}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}

        {/*  Footer  */}
        <footer
          style={{
            paddingTop: 40,
            borderTop: "1px solid #d4d0c8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              color: "#bbb",
              letterSpacing: "0.12em",
            }}
          >
            © Whale Alert Network
          </span>
          <button
            onClick={() => router.push("/")}
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              background: "none",
              border: "1px solid #1a1a1a",
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            Enter Terminal 
          </button>
        </footer>
      </main>
    </div>
  );
}
