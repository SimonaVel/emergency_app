/// Mirrors the backend's Emergency entity (id + name).
class Emergency {
  final int id;
  final String name;

  const Emergency({required this.id, required this.name});

  factory Emergency.fromJson(Map<String, dynamic> json) {
    return Emergency(
      id: json['id'] as int,
      name: json['name'] as String,
    );
  }
}
