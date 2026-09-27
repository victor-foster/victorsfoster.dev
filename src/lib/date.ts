const parts = new Intl.DateTimeFormat('en-US', {
	weekday: 'short',
	month: 'short',
	day: '2-digit',
	year: 'numeric',
	timeZone: 'UTC',
});

/**
 * Nextra's post date format, `Mon Jan 17 2022` (Date#toDateString), computed in UTC:
 * frontmatter dates are midnight UTC, so local time would show the previous day in the Americas.
 */
export function formatPostDate(date: Date): string {
	const p = Object.fromEntries(parts.formatToParts(date).map(({ type, value }) => [type, value]));
	return `${p.weekday} ${p.month} ${p.day} ${p.year}`;
}
