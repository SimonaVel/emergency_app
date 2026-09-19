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

  static Future<Emergency> fetchEmergencyByName(String name) async {
    final uri = Uri.parse(
      '${Parameters.apiBaseUrl}/api/emergencies',
    ).replace(queryParameters: {'name': name});

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return Emergency.fromJson(decoded);
    }

    throw Exception(
      'Failed to load emergency (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<Emergency> fetchEmergency(int id) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies/$id');

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return Emergency.fromJson(decoded);
    }

    throw Exception(
      'Failed to load emergency (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<Map<String, dynamic>> createEmergency(
    String name, {
    int? emergencyType,
  }) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        if (emergencyType != null) 'emergencyType': emergencyType,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    throw Exception(
      'Failed to create emergency (status ${response.statusCode}): ${response.body}',
    );
  }

  /// Updates an emergency. Both fields are optional, matching the backend:
  /// omitting [name] leaves it unchanged, omitting [emergencyType] leaves
  /// the type unchanged, and passing [clearEmergencyType] clears it.
  static Future<bool> updateEmergency(
    int id, {
    String? name,
    int? emergencyType,
    bool clearEmergencyType = false,
  }) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies/$id');

    final response = await http.put(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': ?name,
        'emergencyType': ?emergencyType,
      }),
    );

    if (response.statusCode == 200) {
      return true;
    }

    throw Exception(
      'Failed to update emergency (status ${response.statusCode}): ${response.body}',
    );
  }

  static Future<bool> deleteEmergency(int id) async {
    final uri = Uri.parse('${Parameters.apiBaseUrl}/api/emergencies/$id');

    final response = await http.delete(uri);

    if (response.statusCode == 204) {
      return true;
    }

    throw Exception(
      'Failed to delete emergency (status ${response.statusCode}): ${response.body}',
    );
  }
}
