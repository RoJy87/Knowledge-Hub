import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { messages, type Locale } from '@/locales/messages';
import { useUiStore } from '@/stores/ui.store';

type MessageTree = (typeof messages)[Locale];

function getValue(path: string, locale: Locale): string {
  const segments = path.split('.');
  let current: unknown = messages[locale];

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      current = messages.en;
      for (const fallbackSegment of segments) {
        if (!current || typeof current !== 'object' || !(fallbackSegment in current)) {
          return path;
        }
        current = (current as Record<string, unknown>)[fallbackSegment];
      }
      break;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : path;
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function useLocale() {
  const uiStore = useUiStore();
  const { locale } = storeToRefs(uiStore);

  const dictionary = computed<MessageTree>(() => messages[locale.value]);

  function t(path: string, params?: Record<string, string | number>) {
    return interpolate(getValue(path, locale.value), params);
  }

  function setLocale(nextLocale: Locale) {
    uiStore.setLocale(nextLocale);
  }

  return {
    locale,
    dictionary,
    t,
    setLocale,
    locales: [
      { value: 'ru' as const, label: messages.ru.profile.russian },
      { value: 'en' as const, label: messages.en.profile.english },
    ],
  };
}
