import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  // Types
  type Subject = {
    id : Nat;
    name : Text;
    colorHex : Text;
    createdAt : Int;
  };

  type Goal = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    targetHours : Float;
    completedHours : Float;
    deadline : ?Text;
    createdAt : Int;
  };

  type StudySession = {
    id : Nat;
    subjectId : Nat;
    durationMinutes : Nat;
    date : Text;
    notes : Text;
    createdAt : Int;
  };

  type ScheduleEntry = {
    id : Nat;
    subjectId : Nat;
    dayOfWeek : Nat; // 0 = Sunday
    startTime : Text; // "HH:MM"
    endTime : Text; // "HH:MM"
    entryLabel : Text;
  };

  // Default comparison modules
  module Subject {
    public func compare(s1 : Subject, s2 : Subject) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  module Goal {
    public func compare(g1 : Goal, g2 : Goal) : Order.Order {
      Nat.compare(g1.id, g2.id);
    };
  };

  module StudySession {
    public func compare(ss1 : StudySession, ss2 : StudySession) : Order.Order {
      Nat.compare(ss1.id, ss2.id);
    };
  };

  module ScheduleEntry {
    public func compare(se1 : ScheduleEntry, se2 : ScheduleEntry) : Order.Order {
      Nat.compare(se1.id, se2.id);
    };
  };

  // Data storage
  let subjects = Map.empty<Nat, Subject>();
  let goals = Map.empty<Nat, Goal>();
  let studySessions = Map.empty<Nat, StudySession>();
  let scheduleEntries = Map.empty<Nat, ScheduleEntry>();

  var nextId = 1;

  // Helper functions
  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  // Subject functions
  public shared ({ caller }) func addSubject(name : Text, colorHex : Text) : async Nat {
    let id = getNextId();
    let subject : Subject = {
      id;
      name;
      colorHex;
      createdAt = Time.now();
    };
    subjects.add(id, subject);
    id;
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    subjects.values().toArray().sort();
  };

  public shared ({ caller }) func deleteSubject(subjectId : Nat) : async () {
    if (not subjects.containsKey(subjectId)) {
      Runtime.trap("Subject not found");
    };
    subjects.remove(subjectId);
  };

  // Goal functions
  public shared ({ caller }) func addGoal(subjectId : Nat, title : Text, targetHours : Float, deadline : ?Text) : async Nat {
    if (not subjects.containsKey(subjectId)) {
      Runtime.trap("Subject not found");
    };
    let id = getNextId();
    let goal : Goal = {
      id;
      subjectId;
      title;
      targetHours;
      completedHours = 0.0;
      deadline;
      createdAt = Time.now();
    };
    goals.add(id, goal);
    id;
  };

  public query ({ caller }) func getGoals() : async [Goal] {
    goals.values().toArray().sort();
  };

  public shared ({ caller }) func updateGoalProgress(goalId : Nat, hours : Float) : async () {
    switch (goals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) {
        let updatedGoal : Goal = {
          goal with completedHours = goal.completedHours + hours
        };
        goals.add(goalId, updatedGoal);
      };
    };
  };

  public shared ({ caller }) func deleteGoal(goalId : Nat) : async () {
    if (not goals.containsKey(goalId)) {
      Runtime.trap("Goal not found");
    };
    goals.remove(goalId);
  };

  // Study Session functions
  public shared ({ caller }) func addSession(subjectId : Nat, durationMinutes : Nat, date : Text, notes : Text) : async Nat {
    if (not subjects.containsKey(subjectId)) {
      Runtime.trap("Subject not found");
    };
    let id = getNextId();
    let session : StudySession = {
      id;
      subjectId;
      durationMinutes;
      date;
      notes;
      createdAt = Time.now();
    };
    studySessions.add(id, session);
    id;
  };

  public query ({ caller }) func getSessions() : async [StudySession] {
    studySessions.values().toArray().sort();
  };

  public shared ({ caller }) func deleteSession(sessionId : Nat) : async () {
    if (not studySessions.containsKey(sessionId)) {
      Runtime.trap("Study session not found");
    };
    studySessions.remove(sessionId);
  };

  // Schedule functions
  public shared ({ caller }) func addScheduleEntry(subjectId : Nat, dayOfWeek : Nat, startTime : Text, endTime : Text, entryLabel : Text) : async Nat {
    if (dayOfWeek > 6) {
      Runtime.trap("Invalid day of week");
    };
    if (not subjects.containsKey(subjectId)) {
      Runtime.trap("Subject not found");
    };
    let id = getNextId();
    let entry : ScheduleEntry = {
      id;
      subjectId;
      dayOfWeek;
      startTime;
      endTime;
      entryLabel;
    };
    scheduleEntries.add(id, entry);
    id;
  };

  public query ({ caller }) func getScheduleEntries() : async [ScheduleEntry] {
    scheduleEntries.values().toArray().sort();
  };

  public shared ({ caller }) func deleteScheduleEntry(entryId : Nat) : async () {
    if (not scheduleEntries.containsKey(entryId)) {
      Runtime.trap("Schedule entry not found");
    };
    scheduleEntries.remove(entryId);
  };

  // Aggregate functions
  public query ({ caller }) func getSubjectStudyMinutes(subjectId : Nat) : async Nat {
    var total = 0;
    for (session in studySessions.values()) {
      if (session.subjectId == subjectId) {
        total += session.durationMinutes;
      };
    };
    total;
  };
};
