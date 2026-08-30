package com.fotograf.portfolio.service;

import java.text.Normalizer;
import java.util.Locale;

/** Pretvara naziv u URL-friendly slug (podrzava nasa slova: c, c, z, s, dj). */
public final class Slugify {

    private Slugify() {
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "kategorija";
        }
        String s = input.trim().toLowerCase(Locale.ROOT);
        s = s.replace("đ", "dj").replace("ђ", "dj");
        s = s.replace("č", "c").replace("ć", "c").replace("ž", "z").replace("š", "s");
        s = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        s = s.replaceAll("[^a-z0-9]+", "-");
        s = s.replaceAll("(^-+|-+$)", "");
        return s.isBlank() ? "kategorija" : s;
    }
}
