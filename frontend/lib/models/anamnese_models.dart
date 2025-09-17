/// Modelos para o sistema de anamnese detalhada

class AnamneseQuestion {
  final int id;
  final String category;
  final String question;
  final String type;
  final bool required;
  final String? unit;
  final List<AnamneseOption>? options;
  final String? placeholder;
  final String? helpText;

  const AnamneseQuestion({
    required this.id,
    required this.category,
    required this.question,
    required this.type,
    this.required = false,
    this.unit,
    this.options,
    this.placeholder,
    this.helpText,
  });

  factory AnamneseQuestion.fromJson(Map<String, dynamic> json) {
    return AnamneseQuestion(
      id: json['id'],
      category: json['category'],
      question: json['question'],
      type: json['type'],
      required: json['required'] ?? false,
      unit: json['unit'],
      options: json['options'] != null
          ? (json['options'] as List)
              .map((e) => AnamneseOption.fromJson(e))
              .toList()
          : null,
      placeholder: json['placeholder'],
      helpText: json['helpText'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'question': question,
      'type': type,
      'required': required,
      'unit': unit,
      'options': options?.map((e) => e.toJson()).toList(),
      'placeholder': placeholder,
      'helpText': helpText,
    };
  }
}

class AnamneseOption {
  final String value;
  final String label;

  const AnamneseOption({
    required this.value,
    required this.label,
  });

  factory AnamneseOption.fromJson(Map<String, dynamic> json) {
    return AnamneseOption(
      value: json['value'],
      label: json['label'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'value': value,
      'label': label,
    };
  }
}

class AnamneseAnswer {
  final int questionId;
  final dynamic answer;
  final DateTime timestamp;

  const AnamneseAnswer({
    required this.questionId,
    required this.answer,
    required this.timestamp,
  });

  factory AnamneseAnswer.fromJson(Map<String, dynamic> json) {
    return AnamneseAnswer(
      questionId: json['question_id'],
      answer: json['answer'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'question_id': questionId,
      'answer': answer,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class AnamneseCategory {
  final String key;
  final String name;
  final String icon;
  final String description;
  final int order;

  const AnamneseCategory({
    required this.key,
    required this.name,
    required this.icon,
    required this.description,
    required this.order,
  });

  factory AnamneseCategory.fromJson(Map<String, dynamic> json) {
    return AnamneseCategory(
      key: json['key'],
      name: json['name'],
      icon: json['icon'],
      description: json['description'],
      order: json['order'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'name': name,
      'icon': icon,
      'description': description,
      'order': order,
    };
  }
}

class AnamneseValidation {
  final bool valid;
  final String? message;

  const AnamneseValidation({
    required this.valid,
    this.message,
  });

  factory AnamneseValidation.fromJson(Map<String, dynamic> json) {
    return AnamneseValidation(
      valid: json['valid'],
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'valid': valid,
      'message': message,
    };
  }
}

class AnamneseProgress {
  final int currentQuestion;
  final int totalQuestions;
  final double progress;
  final String currentCategory;
  final bool isComplete;

  const AnamneseProgress({
    required this.currentQuestion,
    required this.totalQuestions,
    required this.progress,
    required this.currentCategory,
    required this.isComplete,
  });

  factory AnamneseProgress.fromJson(Map<String, dynamic> json) {
    return AnamneseProgress(
      currentQuestion: json['current_question'],
      totalQuestions: json['total_questions'],
      progress: json['progress'].toDouble(),
      currentCategory: json['current_category'],
      isComplete: json['is_complete'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current_question': currentQuestion,
      'total_questions': totalQuestions,
      'progress': progress,
      'current_category': currentCategory,
      'is_complete': isComplete,
    };
  }
}
