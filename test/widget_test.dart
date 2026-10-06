// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:emergency_app/main.dart';
import 'package:emergency_app/screens/add_emergency_screen.dart';

void main() {
  testWidgets('add_emergency_type_button redirects sucessfully', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // check the main page has loaded
    expect(find.text('211 Emergency application home page'), findsOneWidget);
    expect(find.byKey(const Key('add_emergency_type_button')), findsOneWidget);

    // press button
    await tester.tap(find.byKey(const Key('add_emergency_type_button')));
    await tester.pumpAndSettle();

    // check if redirection has been executed
    expect(find.byType(AddEmergencyTypeScreen), findsOneWidget);
    expect(find.text('Add emergency type'), findsOneWidget);
  });

  testWidgets('user information can be edited and retained', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());

    await tester.tap(find.byKey(const Key('user_info_button')));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('user_name_field')),
      'Alex Example',
    );
    await tester.enterText(
      find.byKey(const Key('user_phone_field')),
      '+359 888 123 456',
    );
    await tester.tap(find.byKey(const Key('save_user_info_button')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('user_info_button')));
    await tester.pumpAndSettle();

    expect(
      tester
          .widget<TextFormField>(find.byKey(const Key('user_name_field')))
          .controller!
          .text,
      'Alex Example',
    );
    expect(
      tester
          .widget<TextFormField>(find.byKey(const Key('user_phone_field')))
          .controller!
          .text,
      '+359 888 123 456',
    );
  });
}
