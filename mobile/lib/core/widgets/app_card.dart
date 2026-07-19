import 'package:flutter/material.dart';

/// Card padrão do app: cantos arredondados, borda sutil, sombra suave,
/// com feedback de toque (ripple + leve escala) quando [onTap] é fornecido.
class AppCard extends StatefulWidget {
  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(18),
    this.color,
    this.gradient,
    this.borderRadius = 24,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final Color? color;
  final Gradient? gradient;
  final double borderRadius;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final radius = BorderRadius.circular(widget.borderRadius);

    final content = AnimatedScale(
      scale: _pressed ? 0.98 : 1,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOut,
      child: Container(
        padding: widget.padding,
        decoration: BoxDecoration(
          color: widget.gradient == null
              ? (widget.color ?? scheme.surface)
              : null,
          gradient: widget.gradient,
          borderRadius: radius,
          border: widget.gradient == null
              ? Border.all(color: scheme.outlineVariant)
              : null,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: widget.child,
      ),
    );

    if (widget.onTap == null) return content;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: content,
    );
  }
}
