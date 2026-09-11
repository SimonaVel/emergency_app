import 'package:flutter/material.dart';
import 'package:emergency_app/utils/parameters.dart';

class EmergencyButton extends StatelessWidget {
  const EmergencyButton({
    super.key,
    required this.onPressed,
    required this.id,
    required this.text,
  });

  final String id;
  final String text;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      key: Key(id),
      color: Theme.of(context).colorScheme.inversePrimary,
      alignment: Alignment.center,
      margin: EdgeInsets.all(Parameters.buttonPadding),
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          minimumSize: Size(
            double.infinity,
            double.infinity,
          ),
        ),
        child: Text(
          text,
        ),
      ),
    );
  }
}