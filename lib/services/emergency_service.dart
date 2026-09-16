import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:emergency_app/models/emergency.dart';
import 'package:emergency_app/utils/parameters.dart';

/// Talks to the backend's /api/emergencies endpoint.
class EmergencyService {
  static Future<List<Emergency>> fetchEmergencies() async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies');

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body) as List<dynamic>;
      return decoded
          .map((item) => Emergency.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    throw Exception(
      'Failed to load emergencies (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<Map<String, dynamic>> createEmergency(String name) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name}),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    throw Exception(
      'Failed to create emergency (status ${response.statusCode}): ${response.body}',
    );
  }
}
