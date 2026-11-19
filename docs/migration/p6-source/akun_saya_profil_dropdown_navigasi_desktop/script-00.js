tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: "#673de6",
              hover: "#5025d1",
              deep: "#2f1c6a",
              container: "#673de6",
              accent: "#9d99ff"
            },
            surface: {
              DEFAULT: "#ffffff",
              soft: "#f5f6ff",
              neutral: "#f5f5f6",
              border: "#e5e7eb"
            },
            ink: {
              body: "#222225",
              muted: "#62636b",
              subtle: "#9d9ea4"
            },
            "border-subtle": "#e5e7eb",
            "border-bold": "#d1d5db"
          },
          fontFamily: {
            sans: ["'DM Sans'", "sans-serif"],
            body: ["'DM Sans'", "sans-serif"]
          },
          borderRadius: {
            '2xl': '1rem',
            '3xl': '1.5rem',
            '4xl': '1.75rem'
          }
        }
      }
    };
