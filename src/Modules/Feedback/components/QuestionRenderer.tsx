/**
 * QuestionRenderer Component
 *
 * Renders a single survey question based on its answerType.code:
 * free_text, numeric, decimal, multi_choice (radio), select_list (dropdown),
 * multiselect (checkboxes), likert_5, likert_10, star_rating, etc.
 *
 * All values are stored as answer_value (string).
 */

import React, { useCallback } from "react";
import { StarRating } from "../../../components/ui/star-rating";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { getLocalizedString } from "../../Localization/localizationUtils";
import type { QuestionRendererProps, SurveyQuestionOption } from "../types";

const STAR_OR_SCALE_5 = new Set([
	"likert_5",
	"star_rating",
	"scale_1_5",
	"probability_5",
	"frequency_5",
	"agreement_5",
	"quality_5",
	"comparison_5",
	"emoji_rating",
]);
const SCALE_10 = new Set(["likert_10", "scale_1_10"]);
const DROPDOWN_SELECT_ONE = new Set([
	"select_list",
	"single_choice",
	"radio",
	"multiple_choice",
	"yes_no_unsure",
]);
const RADIO_SELECT_ONE = new Set(["multi_choice"]);
const CHECKBOX_MULTIPLE = new Set(["multiselect"]);

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	answerValue,
	onChange,
	className,
}) => {
	const answerStr = answerValue ?? "";
	const type = question.type;

	const handleChange = useCallback(
		(v: string) => onChange({ answerValue: v }),
		[onChange],
	);

	const options = question.options ?? [];
	const sortedOptions =
		options.length > 0
			? [...options].sort((a, b) => a.display_order - b.display_order)
			: [];

	const promptLabel = (
		<p className="text-sm font-medium text-gray-700">
			{question.prompt}
			{question.required && (
				<span className="text-red-500 ml-1" aria-label="required">
					*
				</span>
			)}
		</p>
	);

	// free_text
	if (type === "free_text") {
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<Textarea
					value={answerStr}
					onChange={(e) => handleChange(e.target.value)}
					placeholder={getLocalizedString("placeholder_your_answer")}
					className="min-h-[80px] resize-none"
				/>
			</div>
		);
	}

	// Star / scale 1-5
	if (STAR_OR_SCALE_5.has(type)) {
		const numVal = answerStr !== "" ? parseInt(answerStr, 10) : 0;
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<StarRating
					value={Number.isFinite(numVal) ? numVal : 0}
					onChange={(rating) => handleChange(String(rating))}
					size="md"
					className="justify-start"
				/>
			</div>
		);
	}

	// Scale 1-10 dropdown
	if (SCALE_10.has(type)) {
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<Select value={answerStr || ""} onValueChange={(v) => handleChange(v ?? "")}>
					<SelectTrigger className="w-full max-w-[8rem]">
						<SelectValue placeholder={getLocalizedString("placeholder_select_scale")} />
					</SelectTrigger>
					<SelectContent className="z-[10002] bg-white max-w-[min(20rem,100vw)]">
						{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
							<SelectItem key={n} value={String(n)}>
								{n}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	// numeric (whole number)
	if (type === "numeric") {
		const handleNumeric = (raw: string) => {
			if (raw === "") { handleChange(raw); return; }
			if (raw.startsWith("-")) return;
			handleChange(raw);
		};
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<Input
					type="number"
					min={0}
					value={answerStr}
					onChange={(e) => handleNumeric(e.target.value)}
					className="max-w-[8rem]"
				/>
			</div>
		);
	}

	// decimal
	if (type === "decimal") {
		const handleDecimal = (raw: string) => {
			if (raw === "" || raw === ".") { handleChange(raw); return; }
			if (raw.startsWith("-")) return;
			handleChange(raw);
		};
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<Input
					type="number"
					min={0}
					step="0.01"
					value={answerStr}
					onChange={(e) => handleDecimal(e.target.value)}
					className="max-w-[8rem]"
				/>
			</div>
		);
	}

	// multi_choice (radio group)
	if (RADIO_SELECT_ONE.has(type) && sortedOptions.length > 0) {
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<div className="flex flex-col gap-2">
					{sortedOptions.map((opt) => (
						<Label
							key={opt.id}
							className="flex items-center gap-2 cursor-pointer font-normal text-gray-700"
						>
							<input
								type="radio"
								name={`question-${question.id}`}
								value={opt.value}
								checked={answerStr === opt.value}
								onChange={() => handleChange(opt.value)}
								className="size-4 border-gray-300 text-text-primary focus:ring-text-primary"
							/>
							{opt.label}
						</Label>
					))}
				</div>
			</div>
		);
	}

	// multiselect (checkboxes) - comma-separated values
	if (CHECKBOX_MULTIPLE.has(type) && sortedOptions.length > 0) {
		const selectedSet = new Set(
			answerStr ? answerStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
		);
		const toggle = (opt: SurveyQuestionOption) => {
			const next = new Set(selectedSet);
			if (next.has(opt.value)) next.delete(opt.value);
			else next.add(opt.value);
			handleChange([...next].join(","));
		};
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<div className="flex flex-col gap-2">
					{sortedOptions.map((opt) => (
						<Label
							key={opt.id}
							className="flex items-center gap-2 cursor-pointer font-normal text-gray-700"
						>
							<Checkbox
								checked={selectedSet.has(opt.value)}
								onCheckedChange={() => toggle(opt)}
							/>
							{opt.label}
						</Label>
					))}
				</div>
			</div>
		);
	}

	// select_list (dropdown, select one)
	if (DROPDOWN_SELECT_ONE.has(type) && sortedOptions.length > 0) {
		return (
			<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
				{promptLabel}
				<Select value={answerStr || ""} onValueChange={(v) => handleChange(v ?? "")}>
					<SelectTrigger
						className="w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left"
					>
						<SelectValue placeholder={getLocalizedString("placeholder_select_an_option")} />
					</SelectTrigger>
					<SelectContent className="z-[10002] bg-white max-w-[min(20rem,100vw)]">
						{sortedOptions.map((opt) => (
							<SelectItem
								key={opt.id}
								value={opt.value}
								className="hover:bg-gray-100 break-words"
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	// Fallback: text input
	return (
		<div className={cn("space-y-2", className)} data-testid={`question-${question.id}`}>
			{promptLabel}
			<Input
				type="text"
				value={answerStr}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={getLocalizedString("placeholder_your_answer")}
			/>
		</div>
	);
};

export default QuestionRenderer;
