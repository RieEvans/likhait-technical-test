require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    let!(:existing_category) { Category.create!(name: "Food") }

    it "creates a new category" do
      expect {
        post "/api/categories", params: { category: { name: "Travel" } }, as: :json
      }.to change(Category, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Travel")
    end

    it "returns validation errors for duplicate names" do
      expect {
        post "/api/categories", params: { category: { name: "Food" } }, as: :json
      }.not_to change(Category, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name has already been taken")
    end

    it "returns validation errors for blank names" do
      post "/api/categories", params: { category: { name: " " } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name can't be blank")
    end
  end

  describe "PUT /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food") }
    let!(:other_category) { Category.create!(name: "Transport") }

    it "updates a category" do
      put "/api/categories/#{category.id}", params: { category: { name: "Travel" } }, as: :json

      expect(response).to have_http_status(:success)
      expect(category.reload.name).to eq("Travel")
    end

    it "returns validation errors for duplicate names" do
      put "/api/categories/#{category.id}", params: { category: { name: other_category.name } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name has already been taken")
    end
  end

  describe "DELETE /api/categories/:id" do
    let!(:category) { Category.create!(name: "Travel") }

    it "deletes an unused category" do
      expect {
        delete "/api/categories/#{category.id}"
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns an error when the category has expenses" do
      Expense.create!(
        description: "Lunch",
        amount: 100,
        category: category,
        date: Date.current
      )

      expect {
        delete "/api/categories/#{category.id}"
      }.not_to change(Category, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Cannot delete record because dependent expenses exist")
    end
  end
end
