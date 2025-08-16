import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';

/// Tipos de botão customizado
enum CustomButtonType {
  primary,
  secondary,
  outline,
  text,
  gradient,
}

/// Tamanhos de botão
enum CustomButtonSize {
  small,
  medium,
  large,
}

/// Botão customizado da EvolveYou
class CustomButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final CustomButtonType type;
  final CustomButtonSize size;
  final bool isLoading;
  final bool isDisabled;
  final Widget? icon;
  final Widget? suffixIcon;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final Color? backgroundColor;
  final Color? textColor;
  final Gradient? gradient;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.type = CustomButtonType.primary,
    this.size = CustomButtonSize.medium,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.suffixIcon,
    this.width,
    this.padding,
    this.borderRadius,
    this.backgroundColor,
    this.textColor,
    this.gradient,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: AppConstants.shortAnimation,
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isEnabled = !widget.isDisabled && !widget.isLoading && widget.onPressed != null;

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: SizedBox(
            width: widget.width,
            height: _getButtonHeight(),
            child: _buildButton(context, theme, isEnabled),
          ),
        );
      },
    );
  }

  Widget _buildButton(BuildContext context, ThemeData theme, bool isEnabled) {
    switch (widget.type) {
      case CustomButtonType.primary:
        return _buildPrimaryButton(theme, isEnabled);
      case CustomButtonType.secondary:
        return _buildSecondaryButton(theme, isEnabled);
      case CustomButtonType.outline:
        return _buildOutlineButton(theme, isEnabled);
      case CustomButtonType.text:
        return _buildTextButton(theme, isEnabled);
      case CustomButtonType.gradient:
        return _buildGradientButton(theme, isEnabled);
    }
  }

  Widget _buildPrimaryButton(ThemeData theme, bool isEnabled) {
    return ElevatedButton(
      onPressed: isEnabled ? _handlePress : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: widget.backgroundColor ?? AppColors.primary,
        foregroundColor: widget.textColor ?? AppColors.textOnPrimary,
        disabledBackgroundColor: AppColors.grey300,
        disabledForegroundColor: AppColors.textHint,
        elevation: isEnabled ? 2 : 0,
        shadowColor: AppColors.shadow,
        shape: RoundedRectangleBorder(
          borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
        ),
        padding: widget.padding ?? _getButtonPadding(),
        textStyle: _getTextStyle(theme),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildSecondaryButton(ThemeData theme, bool isEnabled) {
    return ElevatedButton(
      onPressed: isEnabled ? _handlePress : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: widget.backgroundColor ?? AppColors.secondary,
        foregroundColor: widget.textColor ?? AppColors.textOnSecondary,
        disabledBackgroundColor: AppColors.grey300,
        disabledForegroundColor: AppColors.textHint,
        elevation: isEnabled ? 2 : 0,
        shadowColor: AppColors.shadow,
        shape: RoundedRectangleBorder(
          borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
        ),
        padding: widget.padding ?? _getButtonPadding(),
        textStyle: _getTextStyle(theme),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildOutlineButton(ThemeData theme, bool isEnabled) {
    return OutlinedButton(
      onPressed: isEnabled ? _handlePress : null,
      style: OutlinedButton.styleFrom(
        foregroundColor: widget.textColor ?? AppColors.primary,
        disabledForegroundColor: AppColors.textHint,
        side: BorderSide(
          color: isEnabled ? (widget.backgroundColor ?? AppColors.primary) : AppColors.grey300,
          width: 1.5,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
        ),
        padding: widget.padding ?? _getButtonPadding(),
        textStyle: _getTextStyle(theme),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildTextButton(ThemeData theme, bool isEnabled) {
    return TextButton(
      onPressed: isEnabled ? _handlePress : null,
      style: TextButton.styleFrom(
        foregroundColor: widget.textColor ?? AppColors.primary,
        disabledForegroundColor: AppColors.textHint,
        shape: RoundedRectangleBorder(
          borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
        ),
        padding: widget.padding ?? _getButtonPadding(),
        textStyle: _getTextStyle(theme),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildGradientButton(ThemeData theme, bool isEnabled) {
    return Container(
      decoration: BoxDecoration(
        gradient: isEnabled ? (widget.gradient ?? AppColors.primaryGradient) : null,
        color: isEnabled ? null : AppColors.grey300,
        borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
        boxShadow: isEnabled ? [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ] : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? _handlePress : null,
          onTapDown: isEnabled ? (_) => _onTapDown() : null,
          onTapUp: isEnabled ? (_) => _onTapUp() : null,
          onTapCancel: isEnabled ? _onTapCancel : null,
          borderRadius: widget.borderRadius ?? BorderRadius.circular(AppConstants.borderRadius),
          child: Container(
            padding: widget.padding ?? _getButtonPadding(),
            child: _buildButtonContent(),
          ),
        ),
      ),
    );
  }

  Widget _buildButtonContent() {
    if (widget.isLoading) {
      return SizedBox(
        height: _getIconSize(),
        width: _getIconSize(),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            widget.type == CustomButtonType.outline || widget.type == CustomButtonType.text
                ? AppColors.primary
                : AppColors.white,
          ),
        ),
      );
    }

    final children = <Widget>[];

    if (widget.icon != null) {
      children.add(widget.icon!);
      children.add(const SizedBox(width: 8));
    }

    children.add(
      Flexible(
        child: Text(
          widget.text,
          style: _getTextStyle(Theme.of(context)).copyWith(
            color: _getTextColor(),
          ),
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );

    if (widget.suffixIcon != null) {
      children.add(const SizedBox(width: 8));
      children.add(widget.suffixIcon!);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }

  Color _getTextColor() {
    if (widget.isDisabled || (!widget.isLoading && widget.onPressed == null)) {
      return AppColors.textHint;
    }

    if (widget.textColor != null) {
      return widget.textColor!;
    }

    switch (widget.type) {
      case CustomButtonType.primary:
      case CustomButtonType.gradient:
        return AppColors.textOnPrimary;
      case CustomButtonType.secondary:
        return AppColors.textOnSecondary;
      case CustomButtonType.outline:
      case CustomButtonType.text:
        return AppColors.primary;
    }
  }

  TextStyle _getTextStyle(ThemeData theme) {
    switch (widget.size) {
      case CustomButtonSize.small:
        return theme.textTheme.labelMedium!.copyWith(fontWeight: FontWeight.w600);
      case CustomButtonSize.medium:
        return theme.textTheme.labelLarge!.copyWith(fontWeight: FontWeight.w600);
      case CustomButtonSize.large:
        return theme.textTheme.titleMedium!.copyWith(fontWeight: FontWeight.w600);
    }
  }

  double _getButtonHeight() {
    switch (widget.size) {
      case CustomButtonSize.small:
        return 40;
      case CustomButtonSize.medium:
        return AppConstants.buttonHeight;
      case CustomButtonSize.large:
        return 64;
    }
  }

  EdgeInsetsGeometry _getButtonPadding() {
    switch (widget.size) {
      case CustomButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case CustomButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 16);
      case CustomButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 20);
    }
  }

  double _getIconSize() {
    switch (widget.size) {
      case CustomButtonSize.small:
        return 16;
      case CustomButtonSize.medium:
        return 20;
      case CustomButtonSize.large:
        return 24;
    }
  }

  void _handlePress() {
    if (widget.onPressed != null) {
      widget.onPressed!();
    }
  }

  void _onTapDown() {
    setState(() {
      _isPressed = true;
    });
    _animationController.forward();
  }

  void _onTapUp() {
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  void _onTapCancel() {
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }
}

