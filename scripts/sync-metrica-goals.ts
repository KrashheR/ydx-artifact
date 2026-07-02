import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type GoalDefinition = {
  name: string;
  identifier: string;
};

type MetricaCondition = {
  type?: string;
  url?: string;
};

type MetricaGoal = {
  id?: number;
  name?: string;
  type?: string;
  conditions?: MetricaCondition[];
};

type GoalsResponse = {
  goals?: MetricaGoal[];
};

const GOALS: GoalDefinition[] = [
  { name: "Открытие игры", identifier: "aa_game_open" },
  { name: "Сохранение загружено", identifier: "aa_save_loaded" },
  { name: "Игра готова", identifier: "aa_game_ready" },
  { name: "Просмотр экрана", identifier: "aa_screen_view" },
  { name: "Настройки открыты", identifier: "aa_settings_opened" },
  { name: "Настройки закрыты", identifier: "aa_settings_closed" },
  { name: "Язык изменен", identifier: "aa_settings_language_changed" },
  { name: "Кампания выбрана", identifier: "aa_campaign_selected" },
  { name: "Клик по закрытой кампании", identifier: "aa_locked_campaign_clicked" },
  { name: "Клик по карточке уровня", identifier: "aa_level_card_clicked" },
  { name: "Прогресс кампании", identifier: "aa_campaign_progress" },
  { name: "Старт уровня", identifier: "aa_level_start" },
  { name: "Отличие найдено", identifier: "aa_difference_found" },
  { name: "Ошибочный клик на уровне", identifier: "aa_level_misclick" },
  { name: "Подсказка показана", identifier: "aa_hint_revealed" },
  { name: "Лупы потрачены", identifier: "aa_magnifiers_spent" },
  { name: "Проигрыш по таймеру", identifier: "aa_level_failed_timeout" },
  { name: "Время уровня продлено", identifier: "aa_level_time_extended" },
  { name: "Повтор уровня", identifier: "aa_level_retry" },
  { name: "Выход с уровня на карту", identifier: "aa_level_exit_to_map" },
  { name: "Клик по следующему уровню", identifier: "aa_level_next_clicked" },
  { name: "Уровень завершен", identifier: "aa_level_complete" },
  { name: "Старт daily-уровня", identifier: "aa_daily_start_clicked" },
  { name: "Daily-награда получена", identifier: "aa_daily_reward_claimed" },
  { name: "Оффер rewarded-подсказки открыт", identifier: "aa_rewarded_hint_offer_opened" },
  { name: "Rewarded-подсказка запрошена", identifier: "aa_rewarded_hint_requested" },
  { name: "Rewarded-подсказка выдала награду", identifier: "aa_rewarded_hint_rewarded" },
  { name: "Rewarded-подсказка закрыта без награды", identifier: "aa_rewarded_hint_closed" },
  { name: "Rewarded-подсказка не загрузилась", identifier: "aa_rewarded_hint_failed" },
  { name: "Interstitial подходит по условиям", identifier: "aa_interstitial_eligible" },
  { name: "Interstitial запрошен", identifier: "aa_interstitial_request" },
  { name: "Interstitial открыт", identifier: "aa_interstitial_open" },
  { name: "Interstitial закрыт", identifier: "aa_interstitial_close" },
  { name: "Interstitial ошибка", identifier: "aa_interstitial_error" },
  { name: "Review prompt доступен", identifier: "aa_review_prompt_eligible" },
  { name: "Review prompt показан", identifier: "aa_review_prompt_shown" },
  { name: "Review prompt: нажата оценка", identifier: "aa_review_prompt_review_clicked" },
  { name: "Review prompt: нажато позже", identifier: "aa_review_prompt_later_clicked" },
  { name: "Review prompt закрыт", identifier: "aa_review_prompt_closed" },
  { name: "Native review запрошен", identifier: "aa_review_native_requested" },
  { name: "Native review отправлен", identifier: "aa_review_native_sent" },
  { name: "Native review закрыт без отправки", identifier: "aa_review_native_closed" },
  { name: "Native review недоступен", identifier: "aa_review_native_unavailable" },
  { name: "Native review ошибка", identifier: "aa_review_native_error" },
];

const API_BASE = "https://api-metrika.yandex.net/management/v1";

function loadLocalEnv() {
  for (const fileName of [".env.metrica.local", ".env.local"]) {
    const filePath = resolve(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      process.env[key] = process.env[key] ?? value;
    }
  }
}

function hasArg(name: string) {
  return process.argv.includes(name);
}

function getCounterId() {
  return process.env.YANDEX_METRICA_COUNTER_ID ?? process.env.VITE_YANDEX_METRICA_ID;
}

function getToken() {
  return process.env.YANDEX_OAUTH_TOKEN ?? process.env.METRIKA_OAUTH_TOKEN;
}

function getGoalIdentifier(goal: MetricaGoal) {
  return goal.conditions?.find((condition) => condition.url)?.url;
}

async function requestJson<T>(url: string, init: RequestInit, token: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `OAuth ${token}`,
      "Content-Type": "application/x-yametrika+json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    const hint =
      response.status === 403
        ? "\nCheck that the OAuth app has metrika:read and metrika:write scopes, the token was issued after those scopes were added, and the token owner has access to this counter."
        : "";
    throw new Error(`${init.method ?? "GET"} ${url} failed: ${response.status} ${response.statusText}\n${body}${hint}`);
  }

  return (await response.json()) as T;
}

async function fetchExistingGoals(counterId: string, token: string) {
  const response = await requestJson<GoalsResponse>(`${API_BASE}/counter/${counterId}/goals`, { method: "GET" }, token);
  return response.goals ?? [];
}

async function createGoal(counterId: string, token: string, goal: GoalDefinition) {
  return requestJson<unknown>(
    `${API_BASE}/counter/${counterId}/goals`,
    {
      method: "POST",
      body: JSON.stringify({
        goal: {
          name: goal.name,
          type: "action",
          conditions: [{ type: "exact", url: goal.identifier }],
        },
      }),
    },
    token,
  );
}

function printGoalList(goals: GoalDefinition[]) {
  for (const goal of goals) {
    console.log(`${goal.name} -> ${goal.identifier}`);
  }
}

async function main() {
  loadLocalEnv();

  const apply = hasArg("--apply");
  const listOnly = hasArg("--list");
  const counterId = getCounterId();
  const token = getToken();

  if (listOnly) {
    printGoalList(GOALS);
    return;
  }

  if (!counterId) {
    console.error("Set YANDEX_METRICA_COUNTER_ID or VITE_YANDEX_METRICA_ID.");
    process.exitCode = 1;
    return;
  }

  if (!token) {
    console.log("No YANDEX_OAUTH_TOKEN found. Showing local goal list only; API sync requires an OAuth token.");
    printGoalList(GOALS);
    process.exitCode = apply ? 1 : 0;
    return;
  }

  const existingGoals = await fetchExistingGoals(counterId, token);
  const existingIdentifiers = new Set(existingGoals.map(getGoalIdentifier).filter(Boolean));
  const missingGoals = GOALS.filter((goal) => !existingIdentifiers.has(goal.identifier));

  console.log(`Counter: ${counterId}`);
  console.log(`Already exists: ${GOALS.length - missingGoals.length}`);
  console.log(`Missing: ${missingGoals.length}`);

  if (missingGoals.length === 0) {
    console.log("All goals already exist.");
    return;
  }

  if (!apply) {
    console.log("Dry run. Add --apply to create missing goals:");
    printGoalList(missingGoals);
    return;
  }

  for (const goal of missingGoals) {
    await createGoal(counterId, token, goal);
    console.log(`Created: ${goal.name} -> ${goal.identifier}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
