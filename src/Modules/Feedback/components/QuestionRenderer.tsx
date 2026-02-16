/**
 * QuestionRenderer Component
 *
 * Renders based on answer_type_code from freshtrak_private.types_answer:
 * free_text, numeric, decimal, multi_choice (radio), select_list (dropdown),
 * likert_5, likert_10, star_rating, emoji_rating, probability_5, frequency_5,
 * agreement_5, quality_5, comparison_5, yes_no_unsure. Legacy type strings supported.
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
import { QuestionRendererProps, isScaleQuestionType } from "../types";
import type { FeedbackQuestionOption } from "../types";

// answer_type_code from types_answer (freshtrak_private)
const STAR_OR_SCALE_5 = [
	"likert_5",
	"star_rating",
	"scale_1_5",
	"probability_5",
	"frequency_5",
	"agreement_5",
	"quality_5",
	"comparison_5",
	"emoji_rating",
];
const SCALE_10 = ["likert_10", "scale_1_10"];
const DROPDOWN_SELECT_ONE = [
	"select_list",
	"single_choice",
	"radio",
	"multiple_choice",
	"yes_no_unsure",
];
const RADIO_SELECT_ONE = ["multi_choice"];
const CHECKBOX_MULTIPLE = ["multiselect"];

function isStarOrScale5(type: string): boolean {
	return STAR_OR_SCALE_5.includes(type);
}

function isScale10(type: string): boolean {
	return SCALE_10.includes(type);
}

function isDropdownSelectOne(type: string): boolean {
	return DROPDOWN_SELECT_ONE.includes(type);
}

function isRadioSelectOne(type: string): boolean {
	return RADIO_SELECT_ONE.includes(type);
}

function isCheckboxMultiple(type: string): boolean {
	return CHECKBOX_MULTIPLE.includes(type);
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	value,
	answerValue,
	onChange,
	className,
}) => {
	const scaleValue = typeof value === "number" ? value : 0;
	const answerStr = answerValue ?? "";

	const handleRatingChange = useCallback(
		(rating: number) => onChange({ scaleValue: rating }),
		[onChange],
	);

	const handleAnswerChange = useCallback(
		(v: string) => onChange({ answerValue: v }),
		[onChange],
	);

	// API may send options and/or answers (same shape: id, value, label, order)
	const optionsList = question.options ?? question.answers ?? [];
	const sortedOptions =
		optionsList.length > 0 ? [...optionsList].sort((a, b) => a.order - b.order) : [];

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

	// free_text (answer_type_code)
	if (question.type === "free_text") {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<Textarea
					value={answerStr}
					onChange={(e) => handleAnswerChange(e.target.value)}
					placeholder="Your answer"
					className="min-h-[80px] resize-none"
					data-testid={`question-text-${question.id}`}
				/>
			</div>
		);
	}

	// Star / scale 1–5 (likert_5, star_rating, probability_5, etc.)
	if (isStarOrScale5(question.type)) {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<StarRating
					value={scaleValue}
					onChange={handleRatingChange}
					size="md"
					className="justify-start"
					data-testid={`question-rating-${question.id}`}
				/>
				{sortedOptions.length > 0 && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
						{sortedOptions.map((opt) => (
							<span key={opt.id}>
								{opt.value}: {opt.label}
							</span>
						))}
					</div>
				)}
			</div>
		);
	}

	// Scale 1–10 (likert_10)
	if (isScale10(question.type)) {
		const parsed = answerStr !== "" ? parseInt(answerStr, 10) : NaN;
		const validNum =
			Number.isFinite(parsed) && parsed >= 1 && parsed <= 10
				? String(parsed)
				: "";
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<Select
					value={validNum || undefined}
					onValueChange={(v) => handleAnswerChange(v ?? "")}
				>
					<SelectTrigger
						className="w-full max-w-[8rem]"
						data-testid={`question-select-${question.id}`}
					>
						<SelectValue placeholder="Select 1–10" />
					</SelectTrigger>
					<SelectContent className="z-[10002]">
						{Array.from({ length: 10 }, (_, i) => i + 1).map(
							(n) => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
				{sortedOptions.length > 0 && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
						{sortedOptions.map((opt) => (
							<span key={opt.id}>
								{opt.value}: {opt.label}
							</span>
						))}
					</div>
				)}
			</div>
		);
	}

	// Numeric (whole number)
	if (question.type === "numeric") {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<Input
					type="number"
					value={answerStr}
					onChange={(e) => handleAnswerChange(e.target.value)}
					className="max-w-[8rem]"
					data-testid={`question-numeric-${question.id}`}
				/>
			</div>
		);
	}

	// Decimal
	if (question.type === "decimal") {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<Input
					type="number"
					step="0.01"
					value={answerStr}
					onChange={(e) => handleAnswerChange(e.target.value)}
					className="max-w-[8rem]"
					data-testid={`question-decimal-${question.id}`}
				/>
			</div>
		);
	}

	// multi_choice (DB: radio, select one)
	if (isRadioSelectOne(question.type) && sortedOptions.length > 0) {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
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
								onChange={() => handleAnswerChange(opt.value)}
								className="size-4 border-gray-300 text-text-primary focus:ring-text-primary"
								data-testid={`question-option-${question.id}-${opt.id}`}
							/>
							{opt.label}
						</Label>
					))}
				</div>
			</div>
		);
	}

	// Multiselect (checkboxes) – store comma-separated option values
	if (isCheckboxMultiple(question.type) && sortedOptions.length > 0) {
		const selectedSet = new Set(
			answerStr
				? answerStr
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
				: [],
		);
		const toggle = (opt: FeedbackQuestionOption) => {
			const next = new Set(selectedSet);
			if (next.has(opt.value)) next.delete(opt.value);
			else next.add(opt.value);
			handleAnswerChange([...next].join(","));
		};
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
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
								data-testid={`question-option-${question.id}-${opt.id}`}
							/>
							{opt.label}
						</Label>
					))}
				</div>
			</div>
		);
	}

	// select_list / multiple_choice (dropdown, select one)
	if (isDropdownSelectOne(question.type) && sortedOptions.length > 0) {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<Select
					value={answerStr || undefined}
					onValueChange={(v) => handleAnswerChange(v ?? "")}
				>
					<SelectTrigger
						className="w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left"
						data-testid={`question-select-${question.id}`}
					>
						<SelectValue placeholder="Select an option" />
					</SelectTrigger>
					<SelectContent className="z-[10002] bg-white max-w-[min(20rem,100vw)]">
						{sortedOptions.map((opt) => (
							<SelectItem
								key={opt.id}
								value={opt.value}
								data-testid={`question-option-${question.id}-${opt.id}`}
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

	// Fallback: treat as scale 1–5 (backward compatibility)
	if (isScaleQuestionType(question.type)) {
		return (
			<div
				className={cn("space-y-2", className)}
				data-testid={`question-${question.id}`}
			>
				{promptLabel}
				<StarRating
					value={scaleValue}
					onChange={handleRatingChange}
					size="md"
					className="justify-start"
					data-testid={`question-rating-${question.id}`}
				/>
				{sortedOptions.length > 0 && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
						{sortedOptions.map((opt) => (
							<span key={opt.id}>
								{opt.value}: {opt.label}
							</span>
						))}
					</div>
				)}
			</div>
		);
	}

	// Unknown type: show a single text/number input so something is collectible
	return (
		<div
			className={cn("space-y-2", className)}
			data-testid={`question-${question.id}`}
		>
			{promptLabel}
			<Input
				type="text"
				value={answerStr}
				onChange={(e) => handleAnswerChange(e.target.value)}
				placeholder="Your answer"
				data-testid={`question-text-${question.id}`}
			/>
		</div>
	);
};

export default QuestionRenderer;
