import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';

/// Tipos de campo de texto
enum CustomTextFieldType {
  text,
  email,
  password,
  phone,
  number,
  multiline,
}

/// Campo de texto customizado da EvolveYou
class CustomTextField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final String? initialValue;
  final CustomTextFieldType type;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final bool isRequired;
  final bool isReadOnly;
  final bool isEnabled;
  final int? maxLines;
  final int? maxLength;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onEditingComplete;
  final FormFieldValidator<String>? validator;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final bool autofocus;
  final bool obscureText;
  final EdgeInsetsGeometry? contentPadding;
  final BorderRadius? borderRadius;

  const CustomTextField({
    super.key,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.initialValue,
    this.type = CustomTextFieldType.text,
    this.controller,
    this.focusNode,
    this.isRequired = false,
    this.isReadOnly = false,
    this.isEnabled = true,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.onTap,
    this.onChanged,
    this.onSubmitted,
    this.onEditingComplete,
    this.validator,
    this.inputFormatters,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.autofocus = false,
    this.obscureText = false,
    this.contentPadding,
    this.borderRadius,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _focusAnimation;
  late FocusNode _focusNode;
  late TextEditingController _controller;
  bool _obscureText = false;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: AppConstants.shortAnimation,
      vsync: this,
    );
    
    _focusAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _focusNode = widget.focusNode ?? FocusNode();
    _controller = widget.controller ?? TextEditingController(text: widget.initialValue);
    _obscureText = widget.type == CustomTextFieldType.password ? widget.obscureText : false;

    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    if (widget.controller == null) {
      _controller.dispose();
    }
    _animationController.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
    
    if (_isFocused) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          _buildLabel(theme),
          const SizedBox(height: 8),
        ],
        AnimatedBuilder(
          animation: _focusAnimation,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
                boxShadow: _isFocused ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ] : null,
              ),
              child: TextFormField(
                controller: _controller,
                focusNode: _focusNode,
                enabled: widget.isEnabled,
                readOnly: widget.isReadOnly,
                autofocus: widget.autofocus,
                obscureText: _obscureText,
                maxLines: widget.type == CustomTextFieldType.multiline ? null : widget.maxLines,
                maxLength: widget.maxLength,
                keyboardType: _getKeyboardType(),
                textInputAction: widget.textInputAction ?? _getTextInputAction(),
                textCapitalization: widget.textCapitalization,
                inputFormatters: widget.inputFormatters ?? _getInputFormatters(),
                validator: widget.validator,
                onTap: widget.onTap,
                onChanged: widget.onChanged,
                onFieldSubmitted: widget.onSubmitted,
                onEditingComplete: widget.onEditingComplete,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: widget.isEnabled ? AppColors.textPrimary : AppColors.textHint,
                ),
                decoration: InputDecoration(
                  hintText: widget.hint,
                  helperText: widget.helperText,
                  errorText: widget.errorText,
                  prefixIcon: widget.prefixIcon,
                  suffixIcon: _buildSuffixIcon(),
                  contentPadding: widget.contentPadding ?? const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  filled: true,
                  fillColor: _getFillColor(),
                  border: _getBorder(),
                  enabledBorder: _getBorder(),
                  focusedBorder: _getFocusedBorder(),
                  errorBorder: _getErrorBorder(),
                  focusedErrorBorder: _getFocusedErrorBorder(),
                  disabledBorder: _getDisabledBorder(),
                  hintStyle: theme.textTheme.bodyLarge?.copyWith(
                    color: AppColors.textHint,
                  ),
                  helperStyle: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  errorStyle: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.error,
                  ),
                  counterStyle: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildLabel(ThemeData theme) {
    return RichText(
      text: TextSpan(
        text: widget.label,
        style: theme.textTheme.labelLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
        children: widget.isRequired ? [
          TextSpan(
            text: ' *',
            style: TextStyle(
              color: AppColors.error,
              fontWeight: FontWeight.w500,
            ),
          ),
        ] : null,
      ),
    );
  }

  Widget? _buildSuffixIcon() {
    if (widget.type == CustomTextFieldType.password) {
      return IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_off : Icons.visibility,
          color: AppColors.textSecondary,
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      );
    }
    
    return widget.suffixIcon;
  }

  Color _getFillColor() {
    if (!widget.isEnabled) {
      return AppColors.grey100;
    }
    
    if (widget.errorText != null) {
      return AppColors.error.withOpacity(0.05);
    }
    
    if (_isFocused) {
      return AppColors.primary.withOpacity(0.05);
    }
    
    return AppColors.surfaceVariant;
  }

  OutlineInputBorder _getBorder() {
    return OutlineInputBorder(
      borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
      borderSide: const BorderSide(
        color: AppColors.border,
        width: 1,
      ),
    );
  }

  OutlineInputBorder _getFocusedBorder() {
    return OutlineInputBorder(
      borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
      borderSide: const BorderSide(
        color: AppColors.primary,
        width: 2,
      ),
    );
  }

  OutlineInputBorder _getErrorBorder() {
    return OutlineInputBorder(
      borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
      borderSide: const BorderSide(
        color: AppColors.error,
        width: 1,
      ),
    );
  }

  OutlineInputBorder _getFocusedErrorBorder() {
    return OutlineInputBorder(
      borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
      borderSide: const BorderSide(
        color: AppColors.error,
        width: 2,
      ),
    );
  }

  OutlineInputBorder _getDisabledBorder() {
    return OutlineInputBorder(
      borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
      borderSide: const BorderSide(
        color: AppColors.grey200,
        width: 1,
      ),
    );
  }

  TextInputType _getKeyboardType() {
    switch (widget.type) {
      case CustomTextFieldType.email:
        return TextInputType.emailAddress;
      case CustomTextFieldType.phone:
        return TextInputType.phone;
      case CustomTextFieldType.number:
        return TextInputType.number;
      case CustomTextFieldType.multiline:
        return TextInputType.multiline;
      case CustomTextFieldType.password:
      case CustomTextFieldType.text:
      default:
        return TextInputType.text;
    }
  }

  TextInputAction _getTextInputAction() {
    switch (widget.type) {
      case CustomTextFieldType.multiline:
        return TextInputAction.newline;
      default:
        return TextInputAction.next;
    }
  }

  List<TextInputFormatter>? _getInputFormatters() {
    switch (widget.type) {
      case CustomTextFieldType.phone:
        return [
          FilteringTextInputFormatter.digitsOnly,
          LengthLimitingTextInputFormatter(11),
        ];
      case CustomTextFieldType.number:
        return [
          FilteringTextInputFormatter.digitsOnly,
        ];
      case CustomTextFieldType.email:
        return [
          FilteringTextInputFormatter.deny(RegExp(r'\s')), // Remove espaços
        ];
      default:
        return null;
    }
  }
}

