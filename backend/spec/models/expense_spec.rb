require 'rails_helper'

RSpec.describe Expense, type: :model do
  let(:category) { Category.create!(name: "Food") }

  it "is invalid when the expense date is in the future" do
    expense = described_class.new(
      description: "Conference ticket",
      amount: 100,
      category: category,
      date: Date.current + 1.day
    )

    expect(expense).not_to be_valid
    expect(expense.errors[:date]).to include("cannot be in the future. Please choose today or an earlier date.")
  end

  it "allows today's date" do
    expense = described_class.new(
      description: "Lunch",
      amount: 25,
      category: category,
      date: Date.current
    )

    expect(expense).to be_valid
  end
end
