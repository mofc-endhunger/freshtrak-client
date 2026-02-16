/**
 * QuestionRenderer Component
 *
 * Renders a single questionnaire question. Branches on question.type to show
 * the appropriate input: stars (scale_1_5, likert_5), Select dropdown (likert_10,
 * single_choice, multiple_choice), number (numeric), or checkboxes (multiselect, multi_choice).
 */

import React, { useCallback } from "react";
import { StarRating } from "../../../components/ui/star-rating";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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

const SCALE_1_5_TYPES = ["scale_1_5", "likert_5"];
const SCALE_1_10_TYPES = ["scale_1_10", "likert_10"];
const MULTISELECT_TYPES = ["multiselect", "multi_choice"];
const SINGLE_CHOICE_TYPES = ["single_choice", "radio", "multiple_choice"];

function isScale1_5(type: string): boolean {
	return SCALE_1_5_TYPES.includes(type);
}

function isScale1_10(type: string): boolean {
	return SCALE_1_10_TYPES.includes(type);
}

function isMultiselect(type: string): boolean {
	return MULTISELECT_TYPES.includes(type);
}

function isSingleChoice(type: string): boolean {
	return SINGLE_CHOICE_TYPES.includes(type);
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

	const sortedOptions = question.options
		? [...question.options].sort((a, b) => a.order - b.order)
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

	// Scale 1–5 (stars)
	if (isScale1_5(question.type)) {
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

	// Scale 1–10 (shadcn Select)
	if (isScale1_10(question.type)) {
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
					<SelectContent>
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

	// Numeric
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

	// Multiselect (checkboxes) – store comma-separated option values
	if (isMultiselect(question.type) && sortedOptions.length > 0) {
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

	// Single choice / multiple_choice (shadcn Select dropdown)
	if (isSingleChoice(question.type) && sortedOptions.length > 0) {
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
						className="w-full"
						data-testid={`question-select-${question.id}`}
					>
						<SelectValue placeholder="Select an option" />
					</SelectTrigger>
					<SelectContent>
						{sortedOptions.map((opt) => (
							<SelectItem
								key={opt.id}
								value={opt.value}
								data-testid={`question-option-${question.id}-${opt.id}`}
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
