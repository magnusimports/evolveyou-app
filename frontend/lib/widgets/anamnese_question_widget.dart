/// Widget para exibir e responder perguntas da anamnese

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/anamnese_models.dart';

class AnamneseQuestionWidget extends StatefulWidget {
  final AnamneseQuestion question;
  final dynamic answer;
  final AnamneseValidation? validation;
  final Function(dynamic) onAnswerChanged;

  const AnamneseQuestionWidget({
    super.key,
    required this.question,
    required this.answer,
    required this.onAnswerChanged,
    this.validation,
  });

  @override
  State<AnamneseQuestionWidget> createState() => _AnamneseQuestionWidgetState();
}

class _AnamneseQuestionWidgetState extends State<AnamneseQuestionWidget> {
  final TextEditingController _textController = TextEditingController();
  final TextEditingController _numberController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  @override
  void didUpdateWidget(AnamneseQuestionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.answer != widget.answer) {
      _initializeControllers();
    }
  }

  void _initializeControllers() {
    if (widget.question.type == 'text') {
      _textController.text = widget.answer?.toString() ?? '';
    } else if (widget.question.type == 'number') {
      _numberController.text = widget.answer?.toString() ?? '';
    }
  }

  @override
  void dispose() {
    _textController.dispose();
    _numberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildQuestionInput(),
        if (widget.validation != null && !widget.validation!.valid) ...[
          const SizedBox(height: 8),
          _buildValidationError(),
        ],
      ],
    );
  }

  Widget _buildQuestionInput() {
    switch (widget.question.type) {
      case 'text':
        return _buildTextInput();
      case 'number':
        return _buildNumberInput();
      case 'select':
        return _buildSelectInput();
      case 'multiselect':
        return _buildMultiSelectInput();
      case 'slider':
        return _buildSliderInput();
      case 'date':
        return _buildDateInput();
      default:
        return _buildTextInput();
    }
  }

  Widget _buildTextInput() {
    return TextField(
      controller: _textController,
      decoration: InputDecoration(
        hintText: widget.question.placeholder ?? 'Digite sua resposta',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[50],
        prefixIcon: const Icon(Icons.edit),
        suffixIcon: widget.question.unit != null
            ? Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  widget.question.unit!,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              )
            : null,
      ),
      onChanged: (value) => widget.onAnswerChanged(value),
      maxLines: widget.question.question.contains('descreva') ? 3 : 1,
    );
  }

  Widget _buildNumberInput() {
    return TextField(
      controller: _numberController,
      keyboardType: TextInputType.numberWithOptions(decimal: true),
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]')),
      ],
      decoration: InputDecoration(
        hintText: widget.question.placeholder ?? 'Digite um número',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[50],
        prefixIcon: const Icon(Icons.numbers),
        suffixIcon: widget.question.unit != null
            ? Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  widget.question.unit!,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              )
            : null,
      ),
      onChanged: (value) {
        final number = double.tryParse(value.replaceAll(',', '.'));
        widget.onAnswerChanged(number);
      },
    );
  }

  Widget _buildSelectInput() {
    return Column(
      children: widget.question.options?.map((option) {
        final isSelected = widget.answer == option.value;
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          child: InkWell(
            onTap: () => widget.onAnswerChanged(option.value),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1) : Colors.grey[50],
                border: Border.all(
                  color: isSelected ? Theme.of(context).primaryColor : Colors.grey[300]!,
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey[600],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      option.label,
                      style: TextStyle(
                        color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList() ?? [],
    );
  }

  Widget _buildMultiSelectInput() {
    final selectedValues = widget.answer is List ? List<String>.from(widget.answer) : <String>[];
    
    return Column(
      children: widget.question.options?.map((option) {
        final isSelected = selectedValues.contains(option.value);
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          child: InkWell(
            onTap: () {
              final newValues = List<String>.from(selectedValues);
              if (isSelected) {
                newValues.remove(option.value);
              } else {
                newValues.add(option.value);
              }
              widget.onAnswerChanged(newValues);
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1) : Colors.grey[50],
                border: Border.all(
                  color: isSelected ? Theme.of(context).primaryColor : Colors.grey[300]!,
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    isSelected ? Icons.check_box : Icons.check_box_outline_blank,
                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey[600],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      option.label,
                      style: TextStyle(
                        color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList() ?? [],
    );
  }

  Widget _buildSliderInput() {
    final min = 0.0;
    final max = 100.0;
    final currentValue = widget.answer is num ? widget.answer.toDouble() : 50.0;
    
    return Column(
      children: [
        Text(
          '${currentValue.toInt()}${widget.question.unit ?? ''}',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Theme.of(context).primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Slider(
          value: currentValue,
          min: min,
          max: max,
          divisions: 100,
          onChanged: (value) => widget.onAnswerChanged(value),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('${min.toInt()}${widget.question.unit ?? ''}'),
            Text('${max.toInt()}${widget.question.unit ?? ''}'),
          ],
        ),
      ],
    );
  }

  Widget _buildDateInput() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: widget.answer is DateTime ? widget.answer : DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
        );
        if (date != null) {
          widget.onAnswerChanged(date);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today),
            const SizedBox(width: 12),
            Text(
              widget.answer is DateTime
                  ? '${widget.answer.day}/${widget.answer.month}/${widget.answer.year}'
                  : 'Selecione uma data',
              style: TextStyle(
                color: widget.answer is DateTime ? Colors.black87 : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildValidationError() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red[50],
        border: Border.all(color: Colors.red[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red[600], size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              widget.validation!.message ?? 'Erro de validação',
              style: TextStyle(
                color: Colors.red[600],
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
