export type SmartHubSuggestion = {
  id: string;
  date: string;
  scenario: 'subscription_leak' | 'weekend_buffer';
  title: string;
  suggestions: string[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
};

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

function formatMonthDay(value: string) {
  return parseDateOnly(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export async function getSmartHubSuggestion(userId: string, date: string): Promise<SmartHubSuggestion> {
  const dateValue = parseDateOnly(date);
  const isWeekendBuffer = dateValue.getUTCDay() === 5 || dateValue.getUTCDay() === 6 || dateValue.getUTCDay() === 0;

  if (isWeekendBuffer) {
    return {
      id: `smart_hub_weekend_${userId}_${date}`,
      date,
      scenario: 'weekend_buffer',
      title: 'ZUNO SMART HUB',
      suggestions: [
        `AI estimates that your Food and Drinks budget will exhaust on ${formatMonthDay(addDays(date, 1))}.`,
        'You usually overspend on Saturday snacks. Set aside a 120.000 VNĐ weekend buffer from Experience?',
      ],
      primaryActionLabel: 'Yes',
      secondaryActionLabel: 'No',
    };
  }

  return {
    id: `smart_hub_subscription_${userId}_${date}`,
    date,
    scenario: 'subscription_leak',
    title: 'ZUNO SMART HUB',
    suggestions: [
      `AI found a recurring subscription renewal in 7 days on ${formatMonthDay(addDays(date, 7))}.`,
      'Spotify Student may renew for 59.000 VNĐ. Do you want to renew this subscription?',
    ],
    primaryActionLabel: 'Yes',
    secondaryActionLabel: 'No',
  };
}
