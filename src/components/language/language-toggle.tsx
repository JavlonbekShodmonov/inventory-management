"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = React.useState("en");

  React.useEffect(() => {
    const locale = localStorage.getItem("locale") || "en";
    setCurrentLocale(locale);
  }, []);

  const changeLanguage = (locale: string) => {
    localStorage.setItem("locale", locale);
    setCurrentLocale(locale);
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">
            
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          <span className="mr-2">🇺🇸</span>
          <span>English</span>
          {currentLocale === "en" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("ru")}>
          <span className="mr-2">
            ru
          </span>
          <span>Русский</span>
          {currentLocale === "ru" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}